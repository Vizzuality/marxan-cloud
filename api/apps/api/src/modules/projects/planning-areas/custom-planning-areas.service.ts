import { BBox } from 'geojson';
import { Injectable } from '@nestjs/common';
import { isDefined } from '@marxan/utils';
import {
  CustomPlanningAreaRepository,
  planningAreaTableName,
} from '@marxan/planning-area-repository';
import {
  AbstractPlanningAreasService,
  idsMismatched,
  IdsMismatched,
  MultiplePlanningAreaIds,
  notFound,
  NotFound,
  notSupported,
  NotSupported,
  PlanningAreaLocation,
} from './abstract-planning-areas.service';

@Injectable()
export class CustomPlanningAreasService
  implements AbstractPlanningAreasService {
  constructor(private readonly repository: CustomPlanningAreaRepository) {}

  async getPlanningAreaIdAndName(ids: {
    planningAreaGeometryId?: string;
  }): Promise<NotSupported | NotFound | { planningAreaId: string }> {
    const result = await this.locatePlanningAreaEntity(ids);
    if (typeof result === 'object' && 'id' in result) {
      return {
        planningAreaId: result.id,
      };
    }
    return result;
  }

  async getPlanningAreaBBox(
    ids: MultiplePlanningAreaIds,
  ): Promise<{ bbox: BBox } | NotSupported | NotFound | IdsMismatched> {
    const id = ids.planningAreaGeometryId;
    if (!isDefined(id)) return notSupported;
    if (!this.onlyPlanningAreaGeometryIdIsDefined(ids)) return idsMismatched;
    const bbox = await this.repository.getBBox(id);
    if (!isDefined(bbox)) return notFound;

    return {
      bbox,
    };
  }

  async assignProject(
    planningAreaGeometryId: string,
    projectId: string,
  ): Promise<void> {
    await this.repository.assignProject(planningAreaGeometryId, projectId);
  }

  async locatePlanningAreaEntity(
    ids: MultiplePlanningAreaIds,
  ): Promise<PlanningAreaLocation> {
    const id = ids.planningAreaGeometryId;
    if (!isDefined(id)) return notSupported;
    const didFound = await this.repository.has(id);
    if (!didFound) return notFound;
    return {
      id,
      tableName: planningAreaTableName,
    };
  }

  private onlyPlanningAreaGeometryIdIsDefined(
    ids: MultiplePlanningAreaIds,
  ): ids is Pick<Required<MultiplePlanningAreaIds>, 'planningAreaGeometryId'> {
    return (
      isDefined(ids.planningAreaGeometryId) &&
      !isDefined(ids.adminAreaLevel1Id) &&
      !isDefined(ids.adminAreaLevel2Id) &&
      !isDefined(ids.countryId)
    );
  }
}
