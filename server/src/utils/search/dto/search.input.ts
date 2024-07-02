import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SearchQueryInput {
  @Field(() => String)
  q: string;
}
