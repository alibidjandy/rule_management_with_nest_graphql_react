import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Role } from 'src/role/entities/role.entity';
// import { Int } from 'type-graphql';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@ObjectType()
@Entity()
export class User {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Field(() => String, { description: 'User email' })
  email: string;

  @Column({ select: false  })
  @Field(() => String, { description: 'User password', nullable : true })
  password: string;

  @Column({nullable : true })
  @Field(() => String, { description: 'User Name' , nullable : true })
  name: string;

  @Column({ default: true, nullable: true })
  @Field(() => Boolean, { description: 'User role' , nullable : true })
  isAdmin: boolean;

  @Field(() => String, { description: 'Created By' })
  // @Column({ nullable: false })
  @Column({ nullable: false, default: 'admin' })
  createdBy: string;

  ////////////////////

  // @HideField()
  @Field(() => [Role] , { nullable : true})
  @ManyToMany(() => Role, (role) => role.id, {
    nullable: true,
    cascade: true,
  })
  @JoinTable()
  roles: Role[];

  ////////////////////

  // @HideField()
  @Field(() => String)
  @Column({ nullable: true })
  access_token?: string;

  @Field(() => String, { description: 'The user registered time' })
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Number, { description: 'The user update information time' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // logedInfos: [LogedInfo]!;

  @AfterInsert()
  logInsert() {
    console.log('Inserted User with id', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated User with id', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('Removed User with id', this.id);
  }
}
