import { Query } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';
import { BBox } from 'geojson';

export const notFound = Symbol(`Project not found`);

export type GetProjectErrors = typeof notFound;

export interface ProjectSnapshot {
  id: string;
  bbox: BBox;

  /**
   *
   * lowest available level
   *
   * eg BRA.2.13_1
   */
  adminAreaRegion?: string;

  countryId?: string;
  adminAreaLevel1?: string;
  adminAreaLevel2?: string;

  customPlanningArea?: string;
}

export class GetProjectQuery extends Query<
  Either<GetProjectErrors, ProjectSnapshot>
> {
  constructor(
    public readonly projectId: string,
    public readonly requestingUserId?: string,
  ) {
    super();
  }
}
