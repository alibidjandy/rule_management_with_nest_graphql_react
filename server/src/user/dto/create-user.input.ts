import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'email of the user' })
  @IsString()
  @IsEmail()
  email: string;

  @Field(() => String, { description: 'password of the user' })
  @IsString()
  @MinLength(4, {})
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak, please create a stronger password',
  })
  password: string;
}
