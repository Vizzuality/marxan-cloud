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
  implements IInferredQueryHandler<GetProjectQuery> {
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
      });
    } catch (error) {
      /** App Base Service throws 404
       * regardless if NotFound or AccessDenied
       */
      return left(notFound);
    }
  }
}
