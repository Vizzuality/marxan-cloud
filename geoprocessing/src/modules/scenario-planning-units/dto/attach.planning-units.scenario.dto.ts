import {
  IsOptional,
  IsISO31661Alpha3,
  IsEnum,
  IsPositive,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Polygon } from 'geojson';

/**
<<<<<<< HEAD
 * @todo We have this enum duplicated in the api service
 * @file api/src/modules/projects/project.api.entity.ts
=======
 * @description
 * With the scenario, we can easily retrieve the pus so we can attache them to the scenario
 * Also if wdpaThreshold is in the data shared with the job we should concatenate it with the
 * calculation of level of protection of the PUs
 * @todo
 * We have this dto partially duplicated in the api service in
 * @file api/src/modules/scenarios/dto/create.scenario.dto.ts
 *
 * PlanningUnitsJob dto is a partial copy of the dto in
 * @file api/src/modules/projects/dto/create.project.dto.ts
>>>>>>> added reference from where the dto extended came from
 */
export enum PlanningUnitGridShape {
  square = 'square',
  hexagon = 'hexagon',
  fromShapefile = 'from_shapefile',
}

/**
 * @todo We have this interface partially duplicated in the api service
 * @file api/src/modules/projects/dto/create.project.dto.ts
 */
export class PlanningUnitsForScenarioJob {
  @IsUUID(4)
  scenarioId!: string;
  @IsOptional()
  @IsISO31661Alpha3({
    message: 'Not a valid country id',
  })
  countryId?: string;

  @IsOptional()
  adminRegionId?: string;

  @IsOptional()
  adminAreaLevel1Id?: string;

  @IsOptional()
  adminAreaLevel2Id?: string;

  @IsEnum(PlanningUnitGridShape)
  planningUnitGridShape!: PlanningUnitGridShape;

  @IsPositive()
  planningUnitAreakm2!: number;

  // TODO (debt) there is no validation happening even with decorator
  @ValidateNested()
  extent?: Polygon;
}
