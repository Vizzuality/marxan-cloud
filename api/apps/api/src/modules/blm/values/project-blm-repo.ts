import { Either } from 'fp-ts/Either';

export const unknownError = Symbol(`unknown error`);
export const projectNotFound = Symbol(`project not found`);
export const alreadyCreated = Symbol(`project already has defaults`);
export const forbidden = Symbol(`access unauthorized`);

export type CreateFailure = typeof unknownError | typeof alreadyCreated;
export type SaveFailure = typeof unknownError | typeof projectNotFound;
export type GetFailure =
  | typeof unknownError
  | typeof projectNotFound
  | typeof forbidden;

export interface ProjectBlm {
  id: string;

  /**
   * User-supplied or defaults if none provided,
   */
  range: [number, number];

  /**
   * Calculated from range.
   */
  values: number[];

  /**
   * Sets once at the project creation chain - once PU are known.
   */
  defaults: number[];
}

type SaveSuccess = true;

export abstract class ProjectBlmRepo {
  abstract create(
    projectId: string,
    defaults: ProjectBlm['defaults'],
  ): Promise<Either<CreateFailure, SaveSuccess>>;

  abstract update(
    projectId: string,
    range: ProjectBlm['range'],
    values: ProjectBlm['values'],
  ): Promise<Either<SaveFailure, SaveSuccess>>;

  abstract get(projectId: string): Promise<Either<GetFailure, ProjectBlm>>;
}
