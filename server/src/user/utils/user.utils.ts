import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersUtils {
  constructor(
    @InjectRepository(User)
    private users: Repository<User>,
  ) {}

  async getExistingUser(userId: string): Promise<User> {
    const existingUser = await this.users.findOneBy({ id: userId });
    if (!existingUser) {
      throw new BadRequestException(`User with id ${userId} doesn't exist`);
    }
    return existingUser;
  }
}
