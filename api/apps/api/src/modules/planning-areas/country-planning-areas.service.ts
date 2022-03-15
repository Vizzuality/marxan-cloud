import { BBox } from 'geojson';
import { Injectable } from '@nestjs/common';
import { isDefined } from '@marxan/utils';
import { adminAreaTableName } from '@marxan/admin-regions';
import { CountriesService } from '@marxan-api/modules/countries/countries.service';
import {
  AbstractPlanningAreasService,
  MultiplePlanningAreaIds,
  notFound,
  NotFound,
  notSupported,
  NotSupported,
  PlanningAreaLocation,
} from './abstract-planning-areas.service';

@Injectable()
export class CountryPlanningAreasService
  implements AbstractPlanningAreasService
{
  constructor(private readonly countriesService: CountriesService) {}

  async getPlanningAreaIdAndName(ids: {
    countryId?: string;
  }): Promise<
    | NotSupported
    | NotFound
    | { planningAreaId: string; planningAreaName: string }
  > {
    const id = ids.countryId;
    if (!isDefined(id)) return notSupported;
    const countryArea = await this.countriesService.getIdAndNameByGid0(id);
    if (!isDefined(countryArea)) return notFound;
    return {
      planningAreaId: countryArea.gid0,
      planningAreaName: countryArea.name0,
    };
  }

  async getPlanningAreaBBox(
    ids: MultiplePlanningAreaIds,
  ): Promise<{ bbox: BBox } | NotSupported | NotFound> {
    const id = ids.countryId;
    if (!isDefined(id)) return notSupported;
    const countryArea = await this.countriesService.getBBoxByGid0(id);
    if (!isDefined(countryArea)) return notFound;

    // I assume that country gid0 can't be mismatched

    return {
      bbox: countryArea.bbox,
    };
  }

  async locatePlanningAreaEntity(
    ids: MultiplePlanningAreaIds,
  ): Promise<PlanningAreaLocation> {
    const id = ids.countryId;
    if (!isDefined(id)) return notSupported;
    const countryArea = await this.countriesService.getIdAndNameByGid0(id);
    if (!isDefined(countryArea)) return notFound;
    return {
      id: countryArea.id,
      tableName: adminAreaTableName,
    };
  }
}
