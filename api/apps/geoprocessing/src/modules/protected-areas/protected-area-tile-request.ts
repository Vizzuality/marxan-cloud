import { IsOptional, IsString } from 'class-validator';
import { BBox } from 'geojson';
import { TileRequest } from '@marxan/tiles';

export class ProtectedAreaTileRequest extends TileRequest {
  @IsOptional()
  @IsString()
  protectedAreaId?: string;

  @IsOptional()
  bbox?: BBox;
}
