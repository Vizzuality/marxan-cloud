import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';
import { Repository } from 'typeorm';
import { ProjectAclService } from '@marxan-api/modules/access-control/projects-acl/project-acl.service';
import { Either, left, right } from 'fp-ts/lib/Either';
import { projectNotEditable } from '@marxan-api/modules/projects/projects.service';
import { UploadCostSurfaceShapefileDto } from '@marxan-api/modules/cost-surface/dto/upload-cost-surface-shapefile.dto';
import { UpdateCostSurfaceDto } from '@marxan-api/modules/cost-surface/dto/update-cost-surface.dto';
import { CostSurfaceCalculationPort } from '@marxan-api/modules/cost-surface/ports/project/cost-surface-calculation.port';

export const costSurfaceNotEditableWithinProject = Symbol(
  `cost surface not editable within project`,
);

export const costSurfaceNotFound = Symbol(`cost surface not found`);
export const costSurfaceNotFoundForProject = Symbol(
  `cost surface not found for project`,
);
export const costSurfaceNameAlreadyExistsForProject = Symbol(
  `cost surface already exists for project`,
);

@Injectable()
export class CostSurfaceService {
  constructor(
    @InjectRepository(CostSurface)
    private readonly costSurfaceRepository: Repository<CostSurface>,
    private readonly projectAclService: ProjectAclService,
    private readonly calculateCost: CostSurfaceCalculationPort,
  ) {}

  createDefaultCostSurfaceModel(): CostSurface {
    return this.costSurfaceRepository.create({
      name: 'default',
      min: 1,
      max: 1,
      isDefault: true,
    });
  }

  async createDefaultCostSurfaceForProject(
    projectId: string,
    projectName?: string,
  ): Promise<CostSurface> {
    // Min and max will be updated later asynchronously
    const costSurface = this.costSurfaceRepository.create({
      projectId,
      name: CostSurfaceService.defaultCostSurfaceName(projectName),
      isDefault: true,
      min: 0,
      max: 0,
    });

    return this.costSurfaceRepository.save(costSurface);
  }

  async uploadCostSurfaceShapefile(
    userId: string,
    projectId: string,
    costSurfaceDto: UploadCostSurfaceShapefileDto,
    file: Express.Multer.File,
  ): Promise<Either<typeof projectNotEditable, void>> {
    if (
      !(await this.projectAclService.canEditCostSurfaceInProject(
        userId,
        projectId,
      ))
    ) {
      return left(projectNotEditable);
    }
    /**
     * @todo: The min and max values are calculated from values on the geo DB AFTER the shapefile has been processed
     *        pending to implement a event system so that the consumer knows when the cost surface and operations related to it are
     *        available
     */

    const min = 1;
    const max = 10;
    const instance = this.costSurfaceRepository.create({
      name: costSurfaceDto?.name ?? 'default',
      projectId,
      min,
      max,
    });
    const costSurface = await this.costSurfaceRepository.save(instance);
    const result = await this.calculateCost.forShapefile(
      projectId,
      costSurface.id,
      file,
    );
    // TODO: Handle error! Delete cost surface!
    return right(void 0);
  }

  async update(
    userId: string,
    projectId: string,
    costSurfaceId: string,
    dto: UpdateCostSurfaceDto,
  ): Promise<
    Either<
      | typeof projectNotEditable
      | typeof costSurfaceNotFoundForProject
      | typeof costSurfaceNameAlreadyExistsForProject,
      CostSurface
    >
  > {
    if (
      !(await this.projectAclService.canEditCostSurfaceInProject(
        userId,
        projectId,
      ))
    ) {
      return left(projectNotEditable);
    }

    const sameNameCostSurface = await this.costSurfaceRepository.count({
      where: { projectId, name: dto.name },
    });
    if (sameNameCostSurface) {
      return left(costSurfaceNameAlreadyExistsForProject);
    }

    let costSurface = await this.costSurfaceRepository.findOne({
      where: { id: costSurfaceId },
    });
    if (!costSurface) {
      return left(costSurfaceNotFoundForProject);
    }

    costSurface.name = dto.name;

    costSurface = await this.costSurfaceRepository.save(costSurface);

    return right(costSurface);
  }

  static defaultCostSurfaceName(projectName?: string): string {
    return `${projectName ? projectName + ' - ' : ''}Default Cost Surface`;
  }
}
