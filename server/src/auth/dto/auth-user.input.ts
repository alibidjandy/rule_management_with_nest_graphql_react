import { InputType, PickType } from '@nestjs/graphql';
import { CreateUserInput } from 'src/user/dto/create-user.input';

@InputType()
export class AuthUserInput extends PickType(CreateUserInput, [
  'email',
  'password',
] as const) {}
