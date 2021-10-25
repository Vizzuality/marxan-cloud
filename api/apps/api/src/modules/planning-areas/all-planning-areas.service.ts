import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BBox } from 'geojson';
import {
  AbstractPlanningAreasService,
  idsMismatched,
  IdsMismatched,
  MultiplePlanningAreaIds,
  notFound,
  NotFound,
  notSupported,
  NotSupported,
  PlanningAreaAndName,
  PlanningAreaBBoxResult,
  PlanningAreaIdAndNameResult,
  PlanningAreaLocation,
} from './abstract-planning-areas.service';
import { CustomPlanningAreasService } from './custom-planning-areas.service';
import { AdminPlanningAreasService } from './admin-planning-areas.service';
import { CountryPlanningAreasService } from './country-planning-areas.service';
import { isDefined } from '@marxan/utils';

@Injectable()
export class AllPlanningAreasService {
  private readonly services: AbstractPlanningAreasService[];

  constructor(
    private readonly customPlanningAreaService: CustomPlanningAreasService,
    private readonly adminPlanningAreaService: AdminPlanningAreasService,
    private readonly countryPlanningAreaService: CountryPlanningAreasService,
  ) {
    this.services = [
      customPlanningAreaService,
      adminPlanningAreaService,
      countryPlanningAreaService,
    ];
  }

  /**
   * Look up the planning area id and name for this project.
   *
   * In decreasing precedence (i.e. most specific is used):
   *
   * * a project-specific protected area
   * * a level 2 admin area
   * * a level 1 admin area
   * * a country
   */
  async getPlanningAreaIdAndName(
    ids: MultiplePlanningAreaIds,
  ): Promise<
    | {
        planningAreaName?: string;
        planningAreaId?: string;
      }
    | undefined
  > {
    const result = await this.iterateForIdAndName(ids);
    if (result === notSupported) return undefined;

    if (result === notFound)
      throw new InternalServerErrorException(
        `Can not resolve planning area id`,
      );

    return result;
  }

  async locatePlanningAreaEntity(
    ids: MultiplePlanningAreaIds,
  ): Promise<
    | {
        id: string;
        tableName: string;
      }
    | undefined
  > {
    const result = await this.iterateForEntityLocation(ids);
    if (result === notSupported) return undefined;

    if (result === notFound)
      throw new InternalServerErrorException(
        `Can not resolve planning area id`,
      );

    return result;
  }

  async getPlanningAreaBBox(
    ids: MultiplePlanningAreaIds,
  ): Promise<BBox | undefined> {
    const result = await this.iterateForBBoxes(ids);

    if (result === notSupported) return undefined;
    if (result === idsMismatched)
      throw new BadRequestException(
        'Resolved area does not match given levels.',
      );
    if (result === notFound)
      throw new NotFoundException(`There is no area relevant for given input.`);
    return result.bbox;
  }

  async assignProject(ids: {
    planningAreaGeometryId?: string;
    projectId: string;
  }): Promise<void> {
    if (!isDefined(ids.planningAreaGeometryId)) return;
    await this.customPlanningAreaService.assignProject(
      ids.planningAreaGeometryId,
      ids.projectId,
    );
  }

  private async iterateForBBoxes(
    ids: MultiplePlanningAreaIds,
  ): Promise<{ bbox: BBox } | NotSupported | NotFound | IdsMismatched> {
    let result: PlanningAreaBBoxResult = notSupported;
    for (const service of this.services) {
      result = await service.getPlanningAreaBBox(ids);
      if (result !== notSupported) break;
    }
    return result;
  }

  private async iterateForIdAndName(
    ids: MultiplePlanningAreaIds,
  ): Promise<PlanningAreaAndName | NotSupported | NotFound> {
    let result: PlanningAreaIdAndNameResult = notSupported;
    for (const service of this.services) {
      result = await service.getPlanningAreaIdAndName(ids);
      if (result !== notSupported) break;
    }
    return result;
  }

  private async iterateForEntityLocation(
    ids: MultiplePlanningAreaIds,
  ): Promise<PlanningAreaLocation> {
    let result: PlanningAreaLocation = notSupported;
    for (const service of this.services) {
      result = await service.locatePlanningAreaEntity(ids);
      if (result !== notSupported) break;
    }
    return result;
  }
}
