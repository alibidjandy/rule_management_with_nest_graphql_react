import { Field, InputType } from '@nestjs/graphql';
import { FilterOperation } from '../enums';

@InputType()
export class FilterInput {
  @Field(() => FilterOperation)
  operation: FilterOperation;

  @Field(() => [String])
  values: string[];

  @Field(() => String)
  field: string;

  @Field(() => String)
  relationField?: string;
}
