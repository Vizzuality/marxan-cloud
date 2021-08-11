import {
  IsOptional,
  IsISO31661Alpha3,
  IsEnum,
  IsPositive,
} from 'class-validator';

/**
 * @todo We have this enum duplicated in the api service
 * @file api/src/modules/projects/project.api.entity.ts
 */
export enum PlanningUnitGridShape {
  square = 'square',
  hexagon = 'hexagon',
  fromShapefile = 'irregular',
}

/**
 * @todo We have this interface partially duplicated in the api service
 * @file api/src/modules/projects/dto/create.project.dto.ts
 */
export class PlanningUnitsJob {
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

  @IsOptional()
  planningAreaId?: string;

  @IsEnum(PlanningUnitGridShape)
  planningUnitGridShape!: PlanningUnitGridShape;

  @IsPositive()
  planningUnitAreakm2!: number;
}
