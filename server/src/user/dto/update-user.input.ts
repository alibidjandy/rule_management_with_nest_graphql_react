import { CreateUserInput } from './create-user.input';
import { InputType, Field, PickType } from '@nestjs/graphql';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class UpdateUserInput extends PickType(CreateUserInput, [
  'email',
  'password',
] as const) {
  @Field(() => String)
  id: string;

  @Field(() => String, { description: 'User email', nullable: true })
  @IsEmail()
  @IsOptional()
  email: string;

  @Field(() => String, { description: 'User password', nullable: true })
  @IsOptional()
  @MinLength(4, {})
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak, please create a stronger password',
  })
  password: string;

  @Field(() => String, { description: 'User Name', nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  name: string;
}
