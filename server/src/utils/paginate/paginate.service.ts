import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EntityQueryInput } from '../dto/entity-query.input';
import { FilterQueryBuilder } from '../filter/builders/filter-query.builder';
import { SortOrder } from '../sort/dto/sort-options.input';
import { PaginatedResponse } from './entities/pagination-result.entity';

export type FindPaginatedWithFilters<Entity> = {
  repository: Repository<Entity>;
  queryOptions: EntityQueryInput;
  alias: string;
  relations?: string[];
  adminUser?: string;
};

@Injectable()
export class PaginateService {
  async findPaginatedWithFilters<Entity>(
    queryParams: FindPaginatedWithFilters<Entity>,
  ): Promise<PaginatedResponse<Entity>> {
    const {
      repository,
      limit,
      page,
      sortField,
      sortOrder,
      relations,
      alias,
      filters,
      adminUser,
    } = this._mapParamsWithDefault<Entity>(queryParams);

    const filterQueryBuilder = new FilterQueryBuilder<Entity>(
      repository,
      filters,
      alias,
    );
    const queryBuilder: SelectQueryBuilder<Entity> = filterQueryBuilder.build();

    // TODO: investigating how to create query depending on relations array length and values
    let resultsWithTotalCount:
      | PaginatedResponse<Entity>
      | PromiseLike<PaginatedResponse<Entity>>;
    if (relations.length) {
      const [results, total] = await queryBuilder
        .leftJoinAndSelect(`${alias}.${relations[0]}`, `${relations[0]}`)
        .select('user')
        .where('user.createdBy = :createdBy', { createdBy: adminUser })
        // .from('User', 'userInfo')
        // .from('createdBy', 'entity')
        // .where('entity.createdBy = :createdBy', { createdBy: adminUser })
        // .take(limit)
        // .skip((page - 1) * limit)
        // .orderBy(`${alias}.${sortField}`, sortOrder)
        .getManyAndCount();

      // console.log(results, 'results');

      resultsWithTotalCount = { results, total };
    } else {
      const [results, total] = await queryBuilder
        .select('user')
        .where('user.createdBy = :createdBy', { createdBy: adminUser })
        // .from('User', 'userInfo')
        // .take(limit)
        // .where('entity.createdBy = :createdBy', { createdBy: adminUser })
        // .skip((page - 1) * limit)
        // .orderBy(`${alias}.${sortField}`, sortOrder)
        .getManyAndCount();
      // console.log(results, 'results');
      resultsWithTotalCount = { results, total };
    }

    return resultsWithTotalCount;
  }

  private _mapParamsWithDefault<Entity>(
    queryParams: FindPaginatedWithFilters<Entity>,
  ) {
    const { queryOptions, repository, adminUser } = queryParams;

    const alias = queryParams?.alias || '';
    const relations = queryParams?.relations || [];
    const filters = queryOptions?.filters || undefined;
    const limit = queryOptions?.pagination?.limit || 10;
    const page = queryOptions?.pagination?.page || 1;
    const sortField = queryOptions?.sort?.field || 'updatedAt';
    const sortOrder = queryOptions?.sort?.order || SortOrder.DESC;

    return {
      repository,
      limit,
      page,
      sortField,
      sortOrder,
      relations,
      alias,
      filters,
      adminUser,
    };
  }
}
