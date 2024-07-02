import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Role {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => UserRoles)
  @Column()
  title: UserRoles;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.roles, {
    nullable: true,
  })
  user: User[];

  @Field(() => String)
  @Column()
  description: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}

export enum UserRoles {
  ADMIN = 'admin',
  COURIER = 'courier',
  CONTENT_MANAGER = 'content_manager',
  SALES_MANAGER = 'sales_manager',
  MAINTAINER = 'maintainer',
  CUSTOMER = 'customer',
  CONTENT_EXPERT = 'content_expert',
  SALES_EXPERT = 'sales_expert',
}

registerEnumType(UserRoles, {
  name: 'UserRoles',
});
