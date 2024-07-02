import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PaginationOptionsInput {
  @Field(() => Int)
  limit: number;
  @Field(() => Int)
  page: number;
}
