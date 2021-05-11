import {
  IsOptional,
<<<<<<< HEAD
  IsEnum,
  IsUUID,
  Min,
  Max,
  IsInt,
  IsArray,
} from 'class-validator';
import { PlanningUnitsJob } from 'src/modules/planning-units/dto/create.regular.planning-units.dto';
import { IUCNCategory } from 'src/modules/protected-areas/protected-areas.geo.entity';

/**
 * @description
 * With the scenario, we can easily retrieve the pus so we can attache them to the scenario
 * Also if wdpaThreshold is in the data shared with the job we should concatenate it with the
 * calculation of level of protection of the PUs
 * @todo
 * We have this dto partially duplicated in the api service in
 * @file api/src/modules/scenarios/dto/create.scenario.dto.ts
 */
export class PlanningUnitsForScenarioJob extends PlanningUnitsJob {
  @IsUUID(4)
  scenarioId!: string;

  @IsOptional()
  @IsArray()
  @IsEnum(IUCNCategory, { each: true })
  wdpaIucnCategories?: IUCNCategory[];

  @IsOptional()
  @IsUUID(4, { each: true })
  customProtectedAreaIds?: string[];

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  wdpaThreshold?: number;
=======
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
>>>>>>> wip
}
