import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';
import {
  GetProjectErrors,
  GetProjectQuery,
  notFound,
  ProjectSnapshot,
} from '@marxan/projects';
import { ProjectsCrudService } from './projects-crud.service';

@QueryHandler(GetProjectQuery)
export class GetProjectHandler
  implements IInferredQueryHandler<GetProjectQuery>
{
  constructor(private readonly projectsCrud: ProjectsCrudService) {}

  async execute({
    projectId,
    requestingUserId,
  }: GetProjectQuery): Promise<Either<GetProjectErrors, ProjectSnapshot>> {
    try {
      // TODO: Could use repo & ACL module
      const project = await this.projectsCrud.getById(projectId, undefined, {
        authenticatedUser: {
          // Debt: should be able to return Public Projects
          id: requestingUserId ?? '',
        },
      });
      return right({
        id: project.id,
        bbox: project.bbox,
        customPlanningArea: project.planningAreaGeometryId,
        adminAreaRegion:
          project.adminAreaLevel2Id ||
          project.adminAreaLevel1Id ||
          project.countryId,
        adminAreaLevel1: project.adminAreaLevel1Id,
        adminAreaLevel2: project.adminAreaLevel2Id,
        countryId: project.countryId,
      });
    } catch (error) {
      /** App Base Service throws 404
       * regardless if NotFound or AccessDenied
       */
      return left(notFound);
    }
  }
}
