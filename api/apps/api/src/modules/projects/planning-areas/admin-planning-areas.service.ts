import { BBox } from 'geojson';
import { Injectable } from '@nestjs/common';
import { assertDefined, isDefined } from '@marxan/utils';
import { adminAreaTableName } from '@marxan/admin-regions';
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
  PlanningGids,
} from './abstract-planning-areas.service';
import { Gids } from './gids';
import { AdminPlanningAreasRepository } from './admin-planning-areas.repository';

/**
 * picks adminAreaLevel2Id if given, adminAreaLevel1Id otherwise
 */
@Injectable()
export class AdminPlanningAreasService implements AbstractPlanningAreasService {
  constructor(
    private readonly adminAreasRepository: AdminPlanningAreasRepository,
  ) {}
  async getPlanningAreaIdAndName(ids: {
    adminAreaLevel1Id?: string;
    adminAreaLevel2Id?: string;
    countryId?: string;
  }): Promise<
    | { planningAreaId?: string; planningAreaName?: string }
    | NotSupported
    | NotFound
  > {
    const adminAreaLevelId = ids.adminAreaLevel2Id ?? ids.adminAreaLevel1Id;
    if (!isDefined(adminAreaLevelId)) return notSupported;
    const adminAreaFields = await this.adminAreasRepository.findAdminAreaGidsAndNames(
      adminAreaLevelId,
    );
    if (adminAreaFields === notFound) return notFound;
    return {
      planningAreaId:
        adminAreaFields.gid2 ??
        adminAreaFields.gid1 ??
        adminAreaFields.gid0 ??
        undefined,
      planningAreaName:
        adminAreaFields.name2 ??
        adminAreaFields.name1 ??
        adminAreaFields.name0 ??
        undefined,
    };
  }

  async getPlanningAreaBBox(
    ids: PlanningGids,
  ): Promise<{ bbox: BBox } | NotSupported | IdsMismatched | NotFound> {
    const adminAreaLevelId = ids.adminAreaLevel2Id ?? ids.adminAreaLevel1Id;
    if (!isDefined(adminAreaLevelId)) return notSupported;
    const adminArea = await this.adminAreasRepository.findAdminAreaGidsAndBBox(
      adminAreaLevelId,
    );
    if (adminArea === notFound) return notFound;

    const adminAreaGids = Gids.fromGids(adminArea);
    const inputGids = Gids.fromInput(ids);

    if (!adminAreaGids.contains(inputGids)) {
      return idsMismatched;
    }

    const bbox = adminArea.bbox;
    assertDefined(bbox);

    return { bbox };
  }

  async locatePlanningAreaEntity(
    ids: MultiplePlanningAreaIds,
  ): Promise<PlanningAreaLocation> {
    const adminAreaLevelId = ids.adminAreaLevel2Id ?? ids.adminAreaLevel1Id;
    if (!isDefined(adminAreaLevelId)) return notSupported;

    const foundId = await this.adminAreasRepository.findAdminAreaIdByLevelId(
      adminAreaLevelId,
    );

    if (foundId === notFound) return notFound;
    return {
      id: foundId.id,
      tableName: adminAreaTableName,
    };
  }
}
