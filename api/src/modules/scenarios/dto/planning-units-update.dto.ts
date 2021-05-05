import {
  IsOptional,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MultiPolygon } from 'geojson';
import { Type } from 'class-transformer';
import { IsMultiPolygon } from './is-multi-polygon';

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
  @IsMultiPolygon()
  include?: MultiPolygon;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMultiPolygon()
  exclude?: MultiPolygon;
}

export class PlanningUnitsUpdateDto {
  @ApiPropertyOptional()
  @ValidateNested()
  @ValidateIf((dto: PlanningUnitsUpdateDto) => !dto.byGeoJson)
  @Type(() => PlanningUnitsByIdUpdateDto)
  byId?: PlanningUnitsByIdUpdateDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @ValidateIf((dto: PlanningUnitsUpdateDto) => !dto.byId)
  @Type(() => PlanningUnitsByGeoJsonUpdateDto)
  byGeoJson?: PlanningUnitsByGeoJsonUpdateDto;

  exclusiveOptionsMet(): boolean {
    return !Boolean(this.byId && this.byGeoJson);
  }
}
