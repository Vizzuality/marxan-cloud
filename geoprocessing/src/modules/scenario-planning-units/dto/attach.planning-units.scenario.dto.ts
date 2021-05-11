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
 * @todo We have this enum duplicated in the api service
 * @file api/src/modules/projects/project.api.entity.ts
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
