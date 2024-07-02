import { BadRequestException, Injectable } from '@nestjs/common';
import { promisify } from 'util';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserInput } from 'src/user/dto/create-user.input';
import { JwtAccessTokenInput } from './dto/jwtToken.input';
import { RoleService } from '../role/role.service';
import { Tokens } from './entities/tokens.entity';
import { AuthUserInput } from './dto/auth-user.input';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { isEmpty } from 'lodash';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private roleService: RoleService,
    @InjectRepository(User) private userService: Repository<User>,
  ) {}

  async register(
    createUserInput: CreateUserInput,
    adminUser: JwtAccessTokenInput,
  ): Promise<User> {
    const { email, password } = createUserInput;
    const existingUser = await this.getExistingUserByEmail(email, {
      withRestrictedFields: false,
    });

    if (existingUser)
      throw new BadRequestException(
        `User with this email address "${email}" already exists`,
      );

    console.log('test');

    const user = new User();
    user.email = email;

    // Hash the users password
    // Generate a salt
    const salt = randomBytes(8).toString('hex');

    // Hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // Join the hashed result and the salt together
    const result = salt + '.' + hash.toString('hex');

    user.password = result;
    user.createdBy = adminUser.sub;
    // user.createdBy = 'admin';

    const createdUser = await this.userService.save(user);

    const jwtTokens = await this.generateJWTTokens({
      sub: createdUser.id,
      email: createdUser.email,
    });
    // console.log(adminUser, 'adminUser');

    await this.updateRefreshTokenForUser(
      createdUser.id,
      jwtTokens.access_token,
    );
    createdUser.access_token = jwtTokens.access_token;

    // await this.roleService.create({
    //   title: UserRoles.ADMIN,
    //   description: 'this is the Admin Role',
    // });
    // await this.roleService.create({
    //   title: UserRoles.CONTENT_MANAGER,
    //   description: 'this is the content manager Role',
    // });
    // await this.roleService.create({
    //   title: UserRoles.COURIER,
    //   description: 'this is the courier Role',
    // });
    // await this.roleService.create({
    //   title: UserRoles.SALES_MANAGER,
    //   description: 'this is the sale manager Role',
    // });
    // await this.roleService.create({
    //   title: UserRoles.CONTENT_EXPERT,
    //   description: 'this is the content expert Role',
    // });
    // await this.roleService.create({
    //   title: UserRoles.CUSTOMER,
    //   description: 'this is the customer Role',
    // });
    // await this.roleService.create({
    //   title: UserRoles.SALES_EXPERT,
    //   description: 'this is the sales expert Role',
    // });
    // await this.roleService.create({
    //   title: UserRoles.MAINTAINER,
    //   description: 'this is the maintainer Role',
    // });

    // await this.roleService.assignRole({
    //   userId: createdUser.id,
    //   role: UserRoles.ADMIN,
    // });
    // await this.roleService.assignRole({
    //   userId: createdUser.id,
    //   role: UserRoles.CONTENT_MANAGER,
    // });
    // await this.roleService.assignRole({
    //   userId: createdUser.id,
    //   role: UserRoles.COURIER,
    // });
    // await this.roleService.assignRole({
    //   userId: createdUser.id,
    //   role: UserRoles.SALES_MANAGER,
    // });
    // await this.roleService.assignRole({
    //   userId: createdUser.id,
    //   role: UserRoles.CONTENT_EXPERT,
    // });
    // await this.roleService.assignRole({
    //   userId: createdUser.id,
    //   role: UserRoles.CUSTOMER,
    // });
    // await this.roleService.assignRole({
    //   userId: createdUser.id,
    //   role: UserRoles.MAINTAINER,
    // });
    // await this.roleService.assignRole({
    //   userId: createdUser.id,
    //   role: UserRoles.SALES_EXPERT,
    // });

    return createdUser;
  }

  async login(authUserInput: AuthUserInput): Promise<User> {
    const { email, password } = authUserInput;
    const existingUser = await this.getExistingUserByEmail(email, {
      withRestrictedFields: true,
    });
    console.log(existingUser, 'existingUserrr');

    if (!existingUser) {
      throw new ForbiddenException(
        'There is no user with entered email address',
      );
    }

    const [salt, storedHash] = existingUser.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('User email or password is incorrect');
    }

    const jwtTokenPayload: JwtAccessTokenInput = {
      sub: existingUser.id,
      email: existingUser.email,
    };

    const { roles } = await this.roleService.findForUser(existingUser.id);

    if (!isEmpty(roles)) {
      jwtTokenPayload.roles = roles;
    }

    const jwtTokens = await this.generateJWTTokens(jwtTokenPayload);
    // console.log(jwtTokens, 'jwtTokens');

    await this.updateRefreshTokenForUser(
      existingUser.id,
      jwtTokens.access_token,
    );

    existingUser.access_token = jwtTokens.access_token;

    return existingUser;
  }

  async logout(userId: string): Promise<boolean> {
    await this.userService.update(userId, {
      access_token: null,
    });
    return true;
  }

  // async refreshToken(userId: string, refreshToken: string): Promise<Tokens> {
  //   const existingUser = await this.userService.findOneBy({ id: userId });

  //   if (!existingUser) {
  //     throw new ForbiddenException(
  //       `Access denied: user with id ${userId} doesn't exist`,
  //     );
  //   }

  //   if (!existingUser.access_token) {
  //     throw new ForbiddenException(
  //       `Access denied: user with id ${userId} is logged out`,
  //     );
  //   }

  //   const areRefreshTokensMatched = await bcrypt.compare(
  //     existingUser.access_token,
  //     refreshToken,
  //   );

  //   if (!areRefreshTokensMatched) {
  //     throw new ForbiddenException(
  //       'Access denied: refresh tokens are not matched',
  //     );
  //   }

  //   const jwtTokenPayload: JwtAccessTokenInput = {
  //     sub: existingUser.id,
  //     email: existingUser.email,
  //   };

  //   const { roles } = await this.roleService.findForUser(existingUser.id);

  //   if (!isEmpty(roles)) {
  //     jwtTokenPayload.roles = roles;
  //   }

  //   const jwtTokens = await this.generateJWTTokens(jwtTokenPayload);
  //   await this.updateRefreshTokenForUser(
  //     existingUser.id,
  //     jwtTokens.access_token,
  //   );

  //   return {
  //     ...jwtTokens,
  //   };
  // }

  async generateJWTTokens(
    jwtTokenPayload: JwtAccessTokenInput,
  ): Promise<Tokens> {
    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(jwtTokenPayload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: 60 * 55, // 15 min * 100
      }),
    ]);
    return {
      access_token: accessToken,
    };
  }

  async updateRefreshTokenForUser(
    userId: string,
    access_token: string,
  ): Promise<any> {
    return await this.userService.update(userId, {
      access_token,
    });
  }

  async getExistingUserByEmail(
    email: string,
    config: { withRestrictedFields: boolean },
  ): Promise<User> {
    let existingUser: User | PromiseLike<User>;
    // let existingUser;

    if (config.withRestrictedFields) {
      existingUser = await this.userService.findOne({
        select: this.getAllEntityProperties(this.userService),
        where: { email },
      });
    } else {
      existingUser = await this.userService.findOne({
        where: { email },
      });
    }

    return existingUser;
  }

  // Allows to retrieve all columns for Entity from DataBase
  // including fields with  @Column({ select: false }) decorator
  getAllEntityProperties<T>(repository: Repository<T>): (keyof T)[] {
    return repository.metadata.columns.map(
      (col) => col.propertyName,
    ) as (keyof T)[];
  }
}
