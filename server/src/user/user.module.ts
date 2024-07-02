import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PaginateService } from 'src/utils/paginate/paginate.service';
import { RefreshTokenStrategy } from 'src/auth/strategies/refreshToken.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserResolver, UserService, PaginateService, RefreshTokenStrategy],
  exports: [TypeOrmModule],
})
export class UserModule {}
