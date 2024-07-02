import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserRoles } from './role.entity';

@ObjectType()
export class RolesForUser {
  @Field(() => String)
  id: string;
  @Field(() => [UserRoles])
  roles: UserRoles[];
}

@ObjectType()
export class UserRolesRelationEntity {
  @Field(() => String)
  userId: string;
  @Field(() => String)
  roleId: string;
}

export type UserRolesRelation = {
  userId: string;
  roleId: string;
};
