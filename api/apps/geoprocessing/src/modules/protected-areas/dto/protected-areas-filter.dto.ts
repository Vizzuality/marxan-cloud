import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { BBox } from 'geojson';

export class ProtectedAreasFilters {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsNumber({}, { each: true })
  @Transform(({value}): BBox => JSON.parse(value))
  bbox?: BBox;
}
