import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsString } from 'class-validator';
import { UserRoles } from '../entities/role.entity';

@InputType()
export class CreateRoleInput {
  @IsEnum(UserRoles, { message: 'Provided role name is not supported' })
  @Field(() => UserRoles)
  title: UserRoles;

  @Field(() => String)
  @IsString()
  description: string;
}

@InputType()
export class EditRoleInput {
  @Field(() => String)
  userId: string;

  @Field(() => UserRoles)
  @IsEnum(UserRoles, {
    each: true,
    message: 'Provided role name is not supported',
  })
  role: UserRoles;
}
