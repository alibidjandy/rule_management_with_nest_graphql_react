import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';

import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { UserService } from './user.service';
import { UseInterceptors } from '@nestjs/common';
import { PaginatedUsers } from './entities/paginated-users.entity';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { ReadUsersPolicyHandler } from 'src/casl/handlers/user/read-users.handler';
import { ReadUserPolicyHandler } from 'src/casl/handlers/user/read-user.handler';
import { UserNotExistsByIDInterceptor } from './interceptors/not-exists.interceptor';
import { RemoveUserPolicyHandler } from 'src/casl/handlers/user/remove-user.handler';
import { UpdateUserPolicyHandler } from 'src/casl/handlers/user/update-user.handler';
import { EntityQueryInput } from 'src/utils/dto/entity-query.input';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { JwtAccessTokenInput } from 'src/auth/dto/jwtToken.input';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => PaginatedUsers, { name: 'users' })
  @CheckPolicies(ReadUsersPolicyHandler)
  async findAll(
    @Args('options', { nullable: true }) options: EntityQueryInput,
    @CurrentUser() userAdmin: JwtAccessTokenInput,
  ): Promise<PaginatedUsers> {
    return await this.userService.findAll(options, userAdmin);
  }

  @Query(() => User, { name: 'user' })
  @CheckPolicies(ReadUserPolicyHandler)
  @UseInterceptors(UserNotExistsByIDInterceptor)
  async findOneUser(
    @Args('id', { type: () => String }) id: string,
  ): Promise<User> {
    return this.userService.findOneUser(id);
  }

  @Mutation(() => User)
  @CheckPolicies(UpdateUserPolicyHandler)
  @UseInterceptors(UserNotExistsByIDInterceptor)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    // @CurrentUser() user: JwtAccessTokenInput,
  ): Promise<User> {
    return await this.userService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => String)
  @CheckPolicies(RemoveUserPolicyHandler)
  @UseInterceptors(UserNotExistsByIDInterceptor)
  async removeUser(@Args('id', { type: () => String }) id: string): Promise<String> {
    return await this.userService.remove(id);
  }
}
