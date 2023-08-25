import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';
import { Repository } from 'typeorm';
import { ProjectAclService } from '@marxan-api/modules/access-control/projects-acl/project-acl.service';
import { Either, left, right } from 'fp-ts/lib/Either';
import { projectNotEditable } from '@marxan-api/modules/projects/projects.service';
import { UploadCostSurfaceShapefileDto } from '@marxan-api/modules/cost-surface/dto/upload-cost-surface-shapefile.dto';

export const costSurfaceNotEditableWithinProject = Symbol(
  `cost surface not editable within project`,
);

@Injectable()
export class CostSurfaceService {
  constructor(
    @InjectRepository(CostSurface)
    private readonly costSurfaceRepository: Repository<CostSurface>,
    private readonly projectAclService: ProjectAclService,
  ) {}

  async uploadCostSurfaceShapefile(
    userId: string,
    projectId: string,
    dto: UploadCostSurfaceShapefileDto,
    file: Express.Multer.File,
  ): Promise<Either<typeof projectNotEditable, CostSurface>> {
    if (
      !(await this.projectAclService.canEditCostSurfaceInProject(
        userId,
        projectId,
      ))
    ) {
      return left(projectNotEditable);
    }
    /**
     * @TODO The min and max values are calculated from values on the geo DB AFTER the shapfile has been processed
     * Since the new cost surface per project functionality is still to be implemented in the geo side, random values are inserted
     * for now, to be able to create the entity on the API side, since this new cost surface per project is still not used.
     * It's still to be discussed what will be the approach here, wait synchronously for the execution of the UpdateCostSurface
     * command, and retrieve the values, or refactor the process in another way
     */
    const min = 1;
    const max = 10;

    const instance = this.costSurfaceRepository.create({
      name: dto.name,
      projectId,
      min,
      max,
    });
    const costSurface = await this.costSurfaceRepository.save(instance);
    return right(costSurface);
  }
}
