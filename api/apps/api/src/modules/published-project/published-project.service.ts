import { Injectable } from '@nestjs/common';
import { PublishedProjectCrudService } from '@marxan-api/modules/published-project/published-project-crud.service';
import { Repository } from 'typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchSpecification } from 'nestjs-base-service';
import { ProjectsRequest } from '@marxan-api/modules/projects/project-requests-info';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';

@Injectable()
export class PublishedProjectService {
  constructor(
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    private crudService: PublishedProjectCrudService,
  ) {}

  async publish(id: string): Promise<void> {
    // @ToDo when this will not be needed anymore remove Repo from the ProjectsModule exports
    const { name, description } = await this.projectRepository.findOneOrFail(
      id,
    );
    await this.crudService.create({ id, name, description });
  }

  async findAll(fetchSpec: FetchSpecification, info?: ProjectsRequest) {
    return this.crudService.findAllPaginated(fetchSpec, info);
  }

  async findOne(
    id: string,
    info?: ProjectsRequest,
  ): Promise<PublishedProject | undefined> {
    // /ACL slot/
    try {
      return await this.crudService.getById(id, undefined, info);
    } catch (error) {
      // library-sourced errors are no longer instances of HttpException
      return undefined;
    }
  }
}
