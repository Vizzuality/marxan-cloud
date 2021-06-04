import { Polygon } from 'geojson';
import { Injectable } from '@nestjs/common';
import { AdminArea } from '@marxan/admin-regions';
import { CreateProjectDTO } from '../dto/create.project.dto';

type AreaInput = Pick<
  CreateProjectDTO,
  'adminAreaLevel2Id' | 'adminAreaLevel1Id' | 'countryId'
>;

@Injectable()
export class BboxResolver {
  shouldResolveBbox = (adminAreas: AreaInput): boolean =>
    Boolean(
      adminAreas.adminAreaLevel1Id ||
        adminAreas.adminAreaLevel2Id ||
        adminAreas.countryId,
    );

  resolveBBox = (
    adminAreas: AreaInput,
    relatedArea: Partial<AdminArea | undefined>,
  ): Polygon | undefined => {
    if (!relatedArea) {
      throw new Error(`There is no Admin Area relevant for given input.`);
    }

    if (
      relatedArea.gid0 !== adminAreas.countryId ||
      relatedArea.gid1 !== adminAreas.adminAreaLevel1Id ||
      relatedArea.gid2 !== adminAreas.adminAreaLevel2Id
    ) {
      throw new Error(`Resolved Admin Area does not match given levels.`);
    }

    if (relatedArea.bbox) {
      return {
        bbox: relatedArea.bbox,
        type: 'Polygon',
        coordinates: [],
      };
    }
  };
}
