import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationMeta } from '@marxan-api/utils/app-base.service';
import { isDefined } from '@marxan/utils';
import { PublishedProjectCrudService } from '@marxan-api/modules/published-project/published-project-crud.service';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { PublishedProjectResultSingular } from '@marxan-api/modules/published-project/dto/read-result.dtos';

@Injectable()
export class PublishedProjectSerializer {
  constructor(private readonly crud: PublishedProjectCrudService) {}

  async serialize(
    entities: Partial<PublishedProject> | undefined,
    paginationMeta?: PaginationMeta,
  ): Promise<PublishedProjectResultSingular> {
    if (!isDefined(entities)) {
      throw new NotFoundException();
    }
    const result = await this.crud.serialize(entities, paginationMeta);
    return {
      ...result,
      meta: {
        ...(result?.meta ?? {}),
      },
    };
  }

  async serializeAll(
    entities: (Partial<PublishedProject> | undefined)[] | undefined,
    paginationMeta?: PaginationMeta,
  ) {
    if (!isDefined(entities)) {
      throw new NotFoundException();
    }
    return await this.crud.serialize(entities, paginationMeta);
  }
}
