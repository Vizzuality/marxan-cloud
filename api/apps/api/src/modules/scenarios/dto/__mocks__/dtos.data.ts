import {
  PlanningUnitsByGeoJsonUpdateDto,
  PlanningUnitsByIdUpdateDto,
  UpdateScenarioPlanningUnitLockStatusDto,
} from '../update-scenario-planning-unit-lock-status.dto';
import { v4 } from 'uuid';
import { invalidMultiPolygon, sampleMultiPolygonJson } from './geometry';

export const getDtoByIds = (
  include: string[],
  exclude: string[],
): UpdateScenarioPlanningUnitLockStatusDto => {
  const withInvalidIds: UpdateScenarioPlanningUnitLockStatusDto =
    new UpdateScenarioPlanningUnitLockStatusDto();
  const withOptions = new PlanningUnitsByIdUpdateDto();
  withOptions.include = include;
  withOptions.exclude = exclude;
  withInvalidIds.byId = withOptions;

  return withInvalidIds;
};

export const getDtoWithInvalidUuids =
  (): UpdateScenarioPlanningUnitLockStatusDto =>
    getDtoByIds(['non-uuid'], [v4()]);

export const getDtoWithInvalidMultiPolygon =
  (): UpdateScenarioPlanningUnitLockStatusDto => {
    const withInvalidIds: UpdateScenarioPlanningUnitLockStatusDto =
      new UpdateScenarioPlanningUnitLockStatusDto();
    const withOptions = new PlanningUnitsByGeoJsonUpdateDto();
    withOptions.include = [sampleMultiPolygonJson()];
    withOptions.exclude = [invalidMultiPolygon()];

    withInvalidIds.byGeoJson = withOptions;

    return withInvalidIds;
  };
