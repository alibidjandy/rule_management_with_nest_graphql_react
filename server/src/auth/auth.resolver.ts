import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { UserWithTokens } from 'src/user/entities/userWithTokens.entity';
import { TransformInterceptor } from 'src/user/interceptors/mapp-res.interceptor';
import { ValidationPipe } from '@nestjs/common/pipes';
import { CreateUserInput } from 'src/user/dto/create-user.input';
import { AuthUserInput } from './dto/auth-user.input';
import { CurrentUser } from './decorators/currentUser.decorator';
import { JwtAccessTokenInput } from './dto/jwtToken.input';
import { User } from 'src/user/entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  // @Public()
  @Mutation(() => UserWithTokens)
  @UseInterceptors(TransformInterceptor)
  async createUser(
    @Args('createUserInput', new ValidationPipe())
    createUserInput: CreateUserInput,
    @CurrentUser()
    adminUser: JwtAccessTokenInput,
  ): Promise<User> {
    return await this.authService.register(createUserInput, adminUser);
    // return await this.authService.register(createUserInput);
  }

  @Public()
  @Mutation(() => UserWithTokens)
  @UseInterceptors(TransformInterceptor)
  async login(
    @Args('authUserInput', new ValidationPipe())
    authUserInput: AuthUserInput,
  ): Promise<User> {
    const user = await this.authService.login(authUserInput);
    return user;
  }

  @Mutation(() => Boolean)
  async logout(@CurrentUser() user: JwtAccessTokenInput): Promise<boolean> {
    return await this.authService.logout(user.sub);
  }
}
