import { BBox } from 'geojson';

export const notSupported = Symbol('not supported');
export type NotSupported = typeof notSupported;
export const idsMismatched = Symbol('ids mismatched');
export type IdsMismatched = typeof idsMismatched;
export const notFound = Symbol('not found');
export type NotFound = typeof notFound;

export type PlanningAreaAndName = {
  planningAreaId?: string;
  planningAreaName?: string;
};

export type PlanningAreaBBoxResult =
  | {
      bbox: BBox;
    }
  | NotSupported
  | NotFound
  | IdsMismatched;

export type PlanningAreaIdAndNameResult =
  | PlanningAreaAndName
  | NotSupported
  | NotFound;

export type PlanningAreaLocation =
  | {
      id: string;
      tableName: string;
    }
  | NotSupported
  | NotFound;

export type PlanningGids = {
  adminAreaLevel1Id?: string | null;
  adminAreaLevel2Id?: string | null;
  countryId?: string | null;
};
export type MultiplePlanningAreaIds = PlanningGids & {
  planningAreaGeometryId?: string | null;
};

export abstract class AbstractPlanningAreasService {
  abstract getPlanningAreaIdAndName(
    ids: MultiplePlanningAreaIds,
  ): Promise<PlanningAreaIdAndNameResult>;

  abstract getPlanningAreaBBox(
    ids: MultiplePlanningAreaIds,
  ): Promise<PlanningAreaBBoxResult>;

  abstract locatePlanningAreaEntity(
    ids: MultiplePlanningAreaIds,
  ): Promise<PlanningAreaLocation>;
}
