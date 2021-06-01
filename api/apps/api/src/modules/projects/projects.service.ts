import { Injectable } from '@nestjs/common';
import { FetchSpecification } from 'nestjs-base-service';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';

import { GeoFeaturesService } from '@marxan-api/modules/geo-features/geo-features.service';

import { ProjectsCrudService } from './projects-crud.service';
import { ProtectedAreasFacade } from './protected-areas/protected-areas.facade';
import { Project } from './project.api.entity';
import { CreateProjectDTO } from './dto/create.project.dto';
import { UpdateProjectDTO } from './dto/update.project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly geoCrud: GeoFeaturesService,
    private readonly projectsCrud: ProjectsCrudService,
    private readonly protectedAreaShapefile: ProtectedAreasFacade,
  ) {}

  async findAllGeoFeatures(
    fetchSpec: FetchSpecification,
    appInfo?: AppInfoDTO,
  ) {
    // /ACL slot/
    return this.geoCrud.findAllPaginated(fetchSpec, appInfo);
  }

  async findAll(fetchSpec: FetchSpecification, _?: AppInfoDTO) {
    // /ACL slot/
    return this.projectsCrud.findAllPaginated(fetchSpec);
  }

  async findOne(id: string) {
    // /ACL slot/
    return this.projectsCrud.getById(id);
  }

  // TODO debt: shouldn't use API's DTO - avoid relating service to given access layer (Rest)
  async create(input: CreateProjectDTO, info: AppInfoDTO) {
    // /ACL slot - can?/
    return this.projectsCrud.create(input, info);
  }

  async update(projectId: string, input: UpdateProjectDTO) {
    // /ACL slot - can?/
    return this.projectsCrud.update(projectId, input);
  }

  async remove(projectId: string) {
    // /ACL slot - can?/
    return this.projectsCrud.remove(projectId);
  }

  async addShapeFor(
    projectId: string,
    file: Express.Multer.File,
  ): Promise<Error | undefined> /** Debt: move to Either<ErrorSymbol,Ok> */ {
    // /ACL slot - can?/
    try {
      // throws HttpException
      await this.projectsCrud.getById(projectId);
    } catch {
      return new Error(`Not Found`);
    }

    this.protectedAreaShapefile.convert(projectId, file);
    return;
  }

  async importLegacyProject(_: Express.Multer.File) {
    return new Project();
  }
}
