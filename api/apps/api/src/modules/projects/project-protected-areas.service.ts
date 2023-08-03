import {
  forbiddenError,
} from '@marxan-api/modules/access-control';
import {
  Injectable,
} from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';

import { ProjectsCrudService } from './projects-crud.service';
import { ProjectAclService } from '../access-control/projects-acl/project-acl.service';
import { ProtectedArea } from '@marxan/protected-areas';
import { InjectRepository } from '@nestjs/typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Repository } from 'typeorm';
import { projectNotFound } from './projects.service';
import { ProtectedAreasCrudService } from '../protected-areas/protected-areas-crud.service';


@Injectable()
export class ProjectProtectedAreasService {
  constructor(
    @InjectRepository(ProtectedArea, DbConnections.geoprocessingDB)
    protected readonly repository: Repository<ProtectedArea>,
    private readonly projectAclService: ProjectAclService,
    private readonly projectsCrud: ProjectsCrudService,
    private readonly protectedAreasCrudService: ProtectedAreasCrudService,
  ) {}

  async listForProject(
    projectId: string,
    userId: string,
  ): Promise<Either<typeof forbiddenError | typeof projectNotFound, ProtectedArea[]>> {
    if (!(await this.projectAclService.canViewProject(userId, projectId))) {
      return left(forbiddenError);
    }

    const project = await this.projectsCrud.getById(projectId);

    const projectCustomAreas = await this.protectedAreasCrudService.listForProject(project.id);
    
    return right(projectCustomAreas);
  }
}
