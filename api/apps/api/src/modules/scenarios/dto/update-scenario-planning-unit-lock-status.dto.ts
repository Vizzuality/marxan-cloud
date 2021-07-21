import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
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
  @IsArray()
  @IsFeatureCollectionOfPolygons({ each: true })
  include?: FeatureCollection<MultiPolygon | Polygon>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsFeatureCollectionOfPolygons({ each: true })
  exclude?: FeatureCollection<MultiPolygon | Polygon>[];
}

export class UpdateScenarioPlanningUnitLockStatusDto {
  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => PlanningUnitsByIdUpdateDto)
  byId?: PlanningUnitsByIdUpdateDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => PlanningUnitsByGeoJsonUpdateDto)
  byGeoJson?: PlanningUnitsByGeoJsonUpdateDto;
}
