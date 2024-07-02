import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationError } from 'apollo-server-express';
import { isEmpty } from 'lodash';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UsersUtils } from '../user/utils/user.utils';
import { CreateRoleInput, EditRoleInput } from './dto/create-role.input';
import { Role, UserRoles } from './entities/role.entity';
import {
  RolesForUser,
  UserRolesRelation,
} from './entities/rolesForUser.entity';

@Injectable()
export class RoleService {
  private USER_ROLE = 'user_roles_role';
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Role) private roles: Repository<Role>,
    private usersUtils: UsersUtils,
  ) {}

  async findForUser(userId: string): Promise<RolesForUser> {
    await this.usersUtils.getExistingUser(userId);

    const userRoles: UserRolesRelation[] = await this.roles
      .createQueryBuilder()
      .select('"roleId"')
      .from(this.USER_ROLE, 'entity')
      .where('entity.userId = :userId', { userId })
      .execute();
    const uniqueRoleIds = [...new Set(userRoles.map((item) => item.roleId))];

    const roles = [];
    for (const roleId of uniqueRoleIds) {
      const foundRole = await this.roles.findOneBy({ id: roleId });
      roles.push(foundRole);
    }
    let rolesTitles: UserRoles[] | [] = [];

    if (roles) {
      rolesTitles = roles.map((role) => role.title);
    }

    return {
      id: userId,
      roles: rolesTitles,
    };
  }

  async create(createRoleInput: CreateRoleInput): Promise<Role> {
    const existingRole = await this.roles.findOne({
      where: {
        title: createRoleInput.title,
      },
    });

    if (existingRole)
      throw new BadRequestException(
        `Role "${createRoleInput.title}" already exists`,
      );

    const role = new Role();
    role.title = createRoleInput.title;
    role.description = createRoleInput.description;

    return await this.roles.save(role);
  }

  async assignRole(assignRoleInput: EditRoleInput): Promise<boolean> {
    await this.usersUtils.getExistingUser(assignRoleInput.userId);
    const userRolesPayload = [];

    const existingRole = await this.roles.findOne({
      where: {
        title: assignRoleInput.role,
      },
    });

    if (!existingRole) {
      throw new BadRequestException(
        `Role "${assignRoleInput.role}" doesn't exists`,
      );
    }

    userRolesPayload.push({
      userId: assignRoleInput.userId,
      roleId: existingRole.id,
    });

    try {
      await this.roles
        .createQueryBuilder()
        .insert()
        .into(this.USER_ROLE)
        .values(userRolesPayload)
        .returning('*')
        .execute();
    } catch (error) {
      if (error instanceof ValidationError) {
        if (error.code === '23505') {
          throw new BadRequestException(
            'One of the passed roles has been already assigned to the user.',
          );
        }
      }
      // console.log(error);
    }

    return true;
  }

  async remove(removeRoleInput: EditRoleInput): Promise<boolean> {
    await this.usersUtils.getExistingUser(removeRoleInput.userId);
    const rolesIds = [];

    // for (const role of removeRoleInput.roles) {
    const existingRole = await this.roles.findOne({
      where: {
        title: removeRoleInput.role,
      },
    });

    if (!existingRole) {
      throw new BadRequestException(
        `Role "${removeRoleInput.role}" doesn't exists`,
      );
    }

    const assignedRoleToUser: UserRolesRelation[] = await this.roles
      .createQueryBuilder()
      .select('*')
      .from(this.USER_ROLE, 'entity')
      .where('entity.userId = :userId', { userId: removeRoleInput.userId })
      .andWhere('entity.roleId = :roleId', { roleId: existingRole.id })
      .execute();

    if (isEmpty(assignedRoleToUser)) {
      throw new BadRequestException(
        `Role "${removeRoleInput.role}" wasn't assigned to a user with ID ${existingRole.id}.`,
      );
    }

    rolesIds.push(existingRole.id);
    // }

    await this.roles
      .createQueryBuilder()
      .delete()
      .from(this.USER_ROLE)
      .where(
        `${this.USER_ROLE}."userId" = :userId AND ${this.USER_ROLE}."roleId" IN (:...rolesIds)`,
        { userId: removeRoleInput.userId, rolesIds },
      )
      .execute();

    return true;
  }
}
