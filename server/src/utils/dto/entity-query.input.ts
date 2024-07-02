import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { FiltersExpressionInput } from '../filter/dto/filters-expression.input';
import { PaginationOptionsInput } from '../paginate/dto/pagination-options.input';
import { SearchQueryInput } from '../search/dto/search.input';
import { SortOptionsInput } from '../sort/dto/sort-options.input';

@InputType()
export class EntityQueryInput {
  @Field(() => FiltersExpressionInput, { nullable: true })
  filters?: FiltersExpressionInput;

  @Field(() => PaginationOptionsInput, { nullable: true })
  pagination?: PaginationOptionsInput;

  @Field(() => SearchQueryInput, { nullable: true })
  search?: SearchQueryInput;

  @Field(() => SortOptionsInput, { nullable: true })
  sort?: SortOptionsInput;
}
