import { forbiddenError } from '@marxan-api/modules/access-control';
import { Injectable } from '@nestjs/common';
import { Either, isLeft, left, right } from 'fp-ts/Either';

import { ProjectsCrudService } from './projects-crud.service';
import { ProjectAclService } from '../access-control/projects-acl/project-acl.service';
import { ProtectedArea } from '@marxan/protected-areas';
import { InjectRepository } from '@nestjs/typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Repository } from 'typeorm';
import { projectNotFound } from './projects.service';
import { ProtectedAreasCrudService } from '../protected-areas/protected-areas-crud.service';
import { GetProjectQuery } from '@marxan/projects';
import { QueryBus } from '@nestjs/cqrs';
import { FetchSpecification } from 'nestjs-base-service';
import { ProtectedAreasRequestInfo } from '@marxan-api/modules/protected-areas/dto/protected-areas-request-info';

@Injectable()
export class ProjectProtectedAreasService {
  constructor(
    @InjectRepository(ProtectedArea, DbConnections.geoprocessingDB)
    protected readonly repository: Repository<ProtectedArea>,
    private readonly projectAclService: ProjectAclService,
    private readonly projectsCrud: ProjectsCrudService,
    private readonly protectedAreasCrudService: ProtectedAreasCrudService,
    private readonly queryBus: QueryBus,
  ) {}

  async listForProject(
    projectId: string,
    userId: string,
    fetchSpecification: FetchSpecification,
    info: ProtectedAreasRequestInfo,
  ): Promise<
    Either<typeof forbiddenError | typeof projectNotFound, ProtectedArea[]>
  > {
    if (!(await this.projectAclService.canViewProject(userId, projectId))) {
      return left(forbiddenError);
    }

    const projectResponse = await this.queryBus.execute(
      new GetProjectQuery(projectId, userId),
    );

    if (isLeft(projectResponse)) {
      return left(projectNotFound);
    }

    const projectCustomAreas =
      await this.protectedAreasCrudService.listForProject(
        projectResponse.right,
        fetchSpecification,
        { ...info, params: { ...info.params, project: projectResponse.right } },
      );

    return right(projectCustomAreas);
  }
}
