import { Field, InputType, registerEnumType } from '@nestjs/graphql';

@InputType()
export class SortOptionsInput {
  @Field(() => String, { nullable: true })
  field: string;

  @Field(() => SortOrder, { nullable: true })
  order: SortOrder;
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
});
