import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';
import { Repository } from 'typeorm';
import { ProjectAclService } from '@marxan-api/modules/access-control/projects-acl/project-acl.service';
import { Either, left, right } from 'fp-ts/lib/Either';
import { projectNotEditable } from '@marxan-api/modules/projects/projects.service';
import { UploadCostSurfaceShapefileDto } from '@marxan-api/modules/cost-surface/dto/upload-cost-surface-shapefile.dto';
import { UpdateCostSurfaceDto } from '@marxan-api/modules/cost-surface/dto/update-cost-surface.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateProjectCostSurface } from '@marxan-api/modules/cost-surface/application/update-project-cost-surface.command';

export const costSurfaceNotEditableWithinProject = Symbol(
  `cost surface not editable within project`,
);

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
    private readonly commandBus: CommandBus,
  ) {}

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
    await this.commandBus.execute(
      new UpdateProjectCostSurface(projectId, costSurface.id, file),
    );
    return right(void 0);
  }

  async updateCostSurfaceShapefile(
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
}
