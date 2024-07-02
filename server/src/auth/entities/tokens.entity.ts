import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class Tokens {
  @Field(() => String)
  access_token: string;
}
