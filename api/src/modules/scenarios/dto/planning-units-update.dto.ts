import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FeatureCollection } from 'geojson';
import { Type } from 'class-transformer';
import { IsFeatureCollectionOfPolygons } from './is-feature-collection-of-polygons';

export class PlanningUnitsByIdUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('all', { each: true })
  include?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('all', { each: true })
  exclude?: string[];
}

export class PlanningUnitsByGeoJsonUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsFeatureCollectionOfPolygons({ each: true })
  include?: FeatureCollection[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsFeatureCollectionOfPolygons({ each: true })
  exclude?: FeatureCollection[];
}

export class PlanningUnitsUpdateDto {
  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => PlanningUnitsByIdUpdateDto)
  byId?: PlanningUnitsByIdUpdateDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => PlanningUnitsByGeoJsonUpdateDto)
  byGeoJson?: PlanningUnitsByGeoJsonUpdateDto;
}
