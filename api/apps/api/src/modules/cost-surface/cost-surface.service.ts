import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';
import { Repository } from 'typeorm';
import { ProjectAclService } from '@marxan-api/modules/access-control/projects-acl/project-acl.service';
import { Either, left, right } from 'fp-ts/lib/Either';
import {
  projectNotEditable,
  projectNotVisible,
} from '@marxan-api/modules/projects/projects.service';
import { UploadCostSurfaceShapefileDto } from '@marxan-api/modules/cost-surface/dto/upload-cost-surface-shapefile.dto';
import { UpdateCostSurfaceDto } from '@marxan-api/modules/cost-surface/dto/update-cost-surface.dto';
import { forbiddenError } from '@marxan-api/modules/access-control';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import {
  DeleteCostSurfaceCommand,
  deleteCostSurfaceFailed,
} from '@marxan-api/modules/cost-surface/delete-cost-surface/delete-cost-surface.command';
import { CostSurfaceCalculationPort } from '@marxan-api/modules/cost-surface/ports/project/cost-surface-calculation.port';
import { CommandBus } from '@nestjs/cqrs';
import { scenarioNotFound } from '@marxan-api/modules/blm/values/blm-repos';
import {
  LinkCostSurfaceToScenarioCommand,
  LinkCostSurfaceToScenarioError,
} from '@marxan-api/modules/cost-surface/application/scenario/link-cost-surface-to-scenario.command';
import { scenarioNotEditable } from '@marxan-api/modules/scenarios/scenarios.service';
import { ScenarioAclService } from '@marxan-api/modules/access-control/scenarios-acl/scenario-acl.service';

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
export const costSurfaceStillInUse = Symbol(`cost surface still in use`);
export const cannotDeleteDefaultCostSurface = Symbol(
  `cannot delete default cost surface`,
);

export interface CostRange {
  min: number;
  max: number;
}

@Injectable()
export class CostSurfaceService {
  constructor(
    @InjectRepository(CostSurface)
    private readonly costSurfaceRepository: Repository<CostSurface>,
    @InjectRepository(Scenario)
    private readonly scenarioRepository: Repository<Scenario>,
    private readonly projectAclService: ProjectAclService,
    private readonly scenarioAclService: ScenarioAclService,
    private readonly calculateCost: CostSurfaceCalculationPort,
    private readonly commandBus: CommandBus,
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
  ): Promise<CostSurface> {
    // Min and max will be updated later asynchronously
    const costSurface = this.costSurfaceRepository.create({
      projectId,
      name: CostSurfaceService.defaultCostSurfaceName(),
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

  async deleteCostSurface(
    userId: string,
    projectId: string,
    costSurfaceId: string,
  ): Promise<
    Either<
      | typeof projectNotEditable
      | typeof costSurfaceNotFoundForProject
      | typeof costSurfaceStillInUse
      | typeof cannotDeleteDefaultCostSurface
      | typeof deleteCostSurfaceFailed,
      true
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

    const costSurface = await this.costSurfaceRepository.findOne({
      where: { projectId, id: costSurfaceId },
      relations: { scenarios: true },
    });

    if (!costSurface) {
      return left(costSurfaceNotFoundForProject);
    }
    if (costSurface.isDefault) {
      return left(cannotDeleteDefaultCostSurface);
    }
    if (costSurface.scenarios.length > 0) {
      return left(costSurfaceStillInUse);
    }

    return await this.commandBus.execute(
      new DeleteCostSurfaceCommand(costSurfaceId),
    );
  }

  async linkCostSurfaceToScenario(
    userId: string,
    scenarioId: string,
    costSurfaceId: string,
  ): Promise<
    Either<
      | typeof scenarioNotEditable
      | typeof costSurfaceNotFound
      | typeof scenarioNotFound
      | LinkCostSurfaceToScenarioError,
      true
    >
  > {
    const scenario = await this.scenarioRepository.findOne({
      where: { id: scenarioId },
    });
    if (!scenario) {
      return left(scenarioNotFound);
    }

    if (!(await this.scenarioAclService.canEditScenario(userId, scenarioId))) {
      return left(scenarioNotEditable);
    }

    const costSurface = await this.costSurfaceRepository.findOne({
      where: { id: costSurfaceId },
    });
    if (!costSurface) {
      return left(costSurfaceNotFound);
    }

    if (scenario.projectId !== costSurface.projectId) {
      return left(costSurfaceNotFound);
    }
    if (scenario.costSurfaceId === costSurface.id) {
      return right(true);
    }

    return this.commandBus.execute(
      new LinkCostSurfaceToScenarioCommand(scenarioId, costSurfaceId, 'update'),
    );
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

  async getCostSurfaceRange(
    costSurfaceId: string,
    projectId: string,
    userId: string,
  ): Promise<
    Either<
      typeof costSurfaceNotFoundForProject | typeof projectNotVisible,
      CostRange
    >
  > {
    if (!(await this.projectAclService.canViewProject(userId, projectId))) {
      return left(projectNotVisible);
    }
    const costRange = await this.costSurfaceRepository.findOne({
      select: ['min', 'max'],
      where: { id: costSurfaceId, projectId },
    });
    if (costRange) {
      return right({ min: costRange.min, max: costRange.max });
    } else {
      return left(costSurfaceNotFoundForProject);
    }
  }

  async checkProjectCostSurfaceVisibility(
    userId: string,
    projectId: string,
    costSurfaceId: string,
  ): Promise<
    Either<
      typeof costSurfaceNotFoundForProject | typeof projectNotVisible,
      CostSurface
    >
  > {
    const costSurface = await this.costSurfaceRepository.findOne({
      where: { id: costSurfaceId, projectId },
    });
    if (!costSurface) {
      return left(costSurfaceNotFoundForProject);
    }
    if (!(await this.projectAclService.canViewProject(userId, projectId))) {
      return left(projectNotVisible);
    }

    return right(costSurface);
  }

  async getCostSurface(
    userId: string,
    projectId: string,
    costSurfaceId: string,
  ): Promise<
    Either<typeof forbiddenError | typeof costSurfaceNotFound, CostSurface>
  > {
    if (!(await this.projectAclService.canViewProject(userId, projectId))) {
      return left(forbiddenError);
    }

    const costSurface = await this.costSurfaceRepository.findOne({
      where: { projectId, id: costSurfaceId },
      relations: { scenarios: true },
    });

    if (!costSurface) {
      return left(costSurfaceNotFound);
    }

    const result = await this.costSurfaceRepository
      .createQueryBuilder('cs')
      .select('cs.id', 'costSurfaceId')
      .addSelect('COUNT(s.id)', 'usage')
      .leftJoin(Scenario, 's', 'cs.id = s.cost_surface_id')
      .where('cs.project_id = :projectId', { projectId })
      .andWhere('cs.id = :costSurfaceId', { costSurfaceId })
      .orderBy('cs.name', 'ASC')
      .groupBy('cs.id')
      .getRawOne();

    costSurface.scenarioUsageCount = result.usage ? Number(result.usage) : 0;

    return right(costSurface);
  }

  async getCostSurfaces(
    userId: string,
    projectId: string,
  ): Promise<Either<typeof forbiddenError, CostSurface[]>> {
    if (!(await this.projectAclService.canViewProject(userId, projectId))) {
      return left(forbiddenError);
    }
    const costSurfaces = await this.costSurfaceRepository.find({
      where: { projectId },
      relations: { scenarios: true },
    });

    const usageCounts = await this.costSurfaceRepository
      .createQueryBuilder('cs')
      .select('cs.id', 'costSurfaceId')
      .addSelect('COUNT(s.id)', 'usage')
      .leftJoin(Scenario, 's', 'cs.id = s.cost_surface_id')
      .where('cs.project_id = :projectId', { projectId })
      .groupBy('cs.id')
      .getRawMany();

    const usageCountMap = new Map(
      usageCounts.map((usageRow) => [usageRow.costSurfaceId, usageRow.usage]),
    );

    for (const costSurface of costSurfaces) {
      const usage = usageCountMap.get(costSurface.id);
      costSurface.scenarioUsageCount = usage ? Number(usage) : 0;
    }

    return right(costSurfaces);
  }

  static defaultCostSurfaceName(): string {
    return `Default Cost Surface`;
  }
}
