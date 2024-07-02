import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { PaginatedUsers } from './entities/paginated-users.entity';
import { PaginateService } from 'src/utils/paginate/paginate.service';
import { EntityQueryInput } from 'src/utils/dto/entity-query.input';
import { promisify } from 'util';
import { JwtAccessTokenInput } from 'src/auth/dto/jwtToken.input';

const scrypt = promisify(_scrypt);

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly _usersRepo: Repository<User>,
    private readonly _paginateService: PaginateService,
  ) {}

  async findAll(
    queryOptions: EntityQueryInput,
    userAdmin: JwtAccessTokenInput,
  ): Promise<PaginatedUsers> {
    return await this._paginateService.findPaginatedWithFilters<User>({
      repository: this._usersRepo,
      queryOptions,
      alias: 'user',
      relations: ['roles'],
      adminUser: userAdmin.sub,
    });
  }

  async findOneUser(id: string): Promise<User> {
    if (!id) {
      return null;
    }

    const user = await this._usersRepo.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    return await this._usersRepo.find({ where: { email } });
  }

  async update(id: string, attr: Partial<User>) {
    const user = await this.findOneUser(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    Object.assign(user, attr);

    if (attr.password) {
      // Hash the users password
      // Generate a salt
      const salt = randomBytes(8).toString('hex');

      // Hash the salt and the password together
      const hash = (await scrypt(attr.password, salt, 32)) as Buffer;

      // Join the hashed result and the salt together
      const result = salt + '.' + hash.toString('hex'); 

      user.password = result;
    }

    return this._usersRepo.save(user);
  }

  async remove(id: string): Promise<String> {
    const user = await this.findOneUser(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    await this._usersRepo.remove(user);
    return "Deleted Succesfully";
  }

  async findOneByEmail(email: string) {
    const user = await this._usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`${email} not found`);
    }
    return user;
  }
}
