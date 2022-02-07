import { Either } from 'fp-ts/Either';

export const unknownError = Symbol(`unknown error`);
export const projectNotFound = Symbol(`project blm not found`);
export const scenarioNotFound = Symbol(`scenario not found`);
export const alreadyCreated = Symbol(`project already has defaults`);
export type CreateFailure = typeof unknownError | typeof alreadyCreated;
export type SaveFailure = typeof unknownError | typeof projectNotFound;
export type SaveSuccess = true;
export type GetProjectFailure = typeof unknownError | typeof projectNotFound;
export type GetScenarioFailure = typeof unknownError | typeof scenarioNotFound;

export interface Blm {
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

export abstract class ProjectBlmRepo {
  abstract create(
    projectId: string,
    defaults: Blm['defaults'],
  ): Promise<Either<CreateFailure, SaveSuccess>>;

  abstract update(
    projectId: string,
    range: Blm['range'],
    values: Blm['values'],
  ): Promise<Either<SaveFailure, SaveSuccess>>;

  abstract get(projectId: string): Promise<Either<GetProjectFailure, Blm>>;
}

export abstract class ScenarioBlmRepo {
  abstract copy(
    scenarioId: string,
    blm: Blm,
  ): Promise<Either<CreateFailure, SaveSuccess>>;

  abstract update(
    scenarioId: string,
    range: Blm['range'],
    values: Blm['values'],
  ): Promise<Either<SaveFailure, SaveSuccess>>;

  abstract get(scenarioId: string): Promise<Either<GetScenarioFailure, Blm>>;
}
