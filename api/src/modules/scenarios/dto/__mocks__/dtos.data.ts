import {
  PlanningUnitsByGeoJsonUpdateDto,
  PlanningUnitsByIdUpdateDto,
  PlanningUnitsUpdateDto,
} from '../planning-units-update.dto';
import { v4 } from 'uuid';
import { invalidMultiPolygon, sampleMultiPolygonJson } from './geometry';

export const getDtoByIds = (
  include: string[],
  exclude: string[],
): PlanningUnitsUpdateDto => {
  const withInvalidIds: PlanningUnitsUpdateDto = new PlanningUnitsUpdateDto();
  const withOptions = new PlanningUnitsByIdUpdateDto();
  withOptions.include = include;
  withOptions.exclude = exclude;
  withInvalidIds.byId = withOptions;

  return withInvalidIds;
};

export const getDtoWithInvalidUuids = (): PlanningUnitsUpdateDto =>
  getDtoByIds(['non-uuid'], [v4()]);

export const getDtoWithInvalidMultiPolygon = (): PlanningUnitsUpdateDto => {
  const withInvalidIds: PlanningUnitsUpdateDto = new PlanningUnitsUpdateDto();
  const withOptions = new PlanningUnitsByGeoJsonUpdateDto();
  withOptions.include = [sampleMultiPolygonJson()];
  withOptions.exclude = [invalidMultiPolygon()];

  withInvalidIds.byGeoJson = withOptions;

  return withInvalidIds;
};
