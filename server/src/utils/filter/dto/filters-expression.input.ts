import { Field, InputType } from '@nestjs/graphql';
import { FilterOperator } from '../enums';
import { FilterInput } from './filter.input';

@InputType()
export class FiltersExpressionInput {
  @Field(() => FilterOperator)
  operator: FilterOperator;

  @Field(() => [FilterInput])
  filters?: FilterInput[];

  @Field(() => [FiltersExpressionInput])
  childExpressions?: FiltersExpressionInput[];
}
