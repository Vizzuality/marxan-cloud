import { Injectable } from '@nestjs/common';
import { FetchSpecification } from 'nestjs-base-service';
import { AppInfoDTO } from '../../dto/info.dto';

import { GeoFeaturesService } from '../geo-features/geo-features.service';

import { ProjectsCrud } from './projects-crud';
import { ProtectedAreasFacade } from './protected-areas/protected-areas.facade';
import { Project } from './project.api.entity';
import { CreateProjectDTO } from './dto/create.project.dto';
import { UpdateProjectDTO } from './dto/update.project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly geoCrud: GeoFeaturesService,
    private readonly projectsCrud: ProjectsCrud,
    private readonly protectedAreaShapefile: ProtectedAreasFacade,
  ) {}

  async findAllGeoFeatures(
    fetchSpec: FetchSpecification,
    appInfo?: AppInfoDTO,
  ) {
    // Resource Locator /ACL/
    return this.geoCrud.findAllPaginated(fetchSpec, appInfo);
  }

  async findAll(fetchSpec: FetchSpecification, _?: AppInfoDTO) {
    // Resource Locator /ACL/
    return this.projectsCrud.findAllPaginated(fetchSpec);
  }

  async findOne(id: string) {
    // Resource Locator /ACL/
    return this.projectsCrud.getById(id);
  }

  // TODO debt: shouldn't use API's DTO - avoid relating service to given access layer (Rest)
  async create(input: CreateProjectDTO, info: AppInfoDTO) {
    // Resource Locator /ACL - can?/
    return this.projectsCrud.create(input, info);
  }

  async update(projectId: string, input: UpdateProjectDTO) {
    // Resource Locator /find/
    // Resource Locator /ACL - can?/
    return this.projectsCrud.update(projectId, input);
  }

  async remove(projectId: string) {
    // Resource Locator /find/
    // Resource Locator /ACL - can?/
    return this.projectsCrud.remove(projectId);
  }

  addShapeFor(projectId: string, file: Express.Multer.File) {
    // Resource Locator /find/
    // Resource Locator /ACL - can?/
    this.protectedAreaShapefile.convert(projectId, file);
    return;
  }

  async importLegacyProject(_: Express.Multer.File) {
    return new Project();
  }
}
