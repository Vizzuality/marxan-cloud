import { NestMiddleware, Injectable, Logger } from '@nestjs/common';
import { DEFAULT_PAGINATION } from 'nestjs-base-service';
import { parseInt } from 'lodash';

const defaultFetchSpec = {
  fields: [],
  includes: [],
  sort: [],
};

/* eslint-disable @typescript-eslint/no-unused-vars */
class ConfigPagination {
  includes?: string[] = [];
  allowIncludes?: string[] = [];
}

@Injectable()
export class PaginationMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: () => void): any {
    Logger.debug('Checking pagination data');
    const fetchSpecification = {
      ...DEFAULT_PAGINATION,
      ...defaultFetchSpec,
      ...req.query,
    };

    const pageSize = parseInt(req?.query?.page?.size);
    fetchSpecification.pageSize =
      typeof pageSize === 'number' && pageSize > 0 ? pageSize : undefined;

    const pageNumber = parseInt(req?.query?.page?.number);
    fetchSpecification.pageNumber =
      typeof pageNumber === 'number' && pageNumber > 0 ? pageNumber : undefined;

    fetchSpecification.fields = req?.query?.fields?.split(',');
    if (fetchSpecification.fields?.indexOf('id') < 0) {
      fetchSpecification.fields.push('id');
    }

    /**
     * @todo Possibly reinstate whitelisting of allowed includes, e.g.
     * (...).filter(inc => prePagination.allowIncludes.indexOf(inc) >= 0);
     */
    fetchSpecification.includes = req?.query?.includes?.split(',');

    /**
     * @debt We are already interpreting `+` and `-` prefixes in
     * `PaginationUtil`, so doing it here must be removed - we can pass the sort
     * param values as they are to `PaginationUtil.addPagination()`.
     */
    fetchSpecification.sort = req?.query?.sort
      ?.split(',')
      .map((stat: string) => {
        if (stat.startsWith('-')) {
          return { column: stat.slice(1, stat.length), order: 'DESC' };
        }
        if (stat.startsWith('+')) {
          return { column: stat.slice(1, stat.length), order: 'ASC' };
        }
        return { column: stat, order: 'ASC' };
      });

    if (!req.fetchSpecification) {
      req.fetchSpecification = {};
    }

    req.fetchSpecification = fetchSpecification;
    next();
  }
}
