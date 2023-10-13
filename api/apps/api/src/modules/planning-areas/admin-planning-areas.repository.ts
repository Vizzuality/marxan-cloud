import { Injectable, NotFoundException } from '@nestjs/common';
import { assertDefined } from '@marxan/utils';
import { AdminArea } from '@marxan/admin-regions';
import { AdminAreasService } from '@marxan-api/modules/admin-areas/admin-areas.service';
import { notFound, NotFound } from './abstract-planning-areas.service';

@Injectable()
export class AdminPlanningAreasRepository {
  constructor(private readonly adminAreasService: AdminAreasService) {}

  async findAdminAreaIdByLevelId(adminAreaId: string) {
    const foundId: Pick<AdminArea, 'id'> | NotFound =
      await this.adminAreasService
        .getByLevel1OrLevel2Id(adminAreaId, {
          fields: ['id'],
        })
        .then(({ id }) => {
          assertDefined(id);
          return { id };
        })
        .catch(AdminPlanningAreasRepository.catchNotFound);
    return foundId;
  }

  async findAdminAreaGidsAndBBox(adminAreaId: string) {
    const adminArea:
      | Pick<AdminArea, 'gid0' | 'gid1' | 'gid2' | 'bbox'>
      | NotFound = await this.adminAreasService
      .getByLevel1OrLevel2Id(adminAreaId, {
        fields: ['gid0', 'gid1', 'gid2', 'bbox'],
      })
      .catch(AdminPlanningAreasRepository.catchNotFound);
    return adminArea;
  }

  async findAdminAreaGidsAndNames(adminAreaId: string) {
    const adminAreaFields:
      | Pick<AdminArea, 'gid0' | 'gid1' | 'gid2' | 'name2' | 'name1' | 'name0'>
      | NotFound = await this.adminAreasService
      .getByLevel1OrLevel2Id(adminAreaId, {
        fields: ['gid0', 'gid1', 'gid2', 'name2', 'name1', 'name0'],
      })
      .catch(AdminPlanningAreasRepository.catchNotFound);
    return adminAreaFields;
  }

  private static catchNotFound(error: unknown): NotFound {
    if (error instanceof NotFoundException) return notFound;
    else throw error;
  }
}
