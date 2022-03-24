import { IsOptional, IsString } from 'class-validator';
import { BBox } from 'geojson';
import { TileRequest } from '@marxan/tiles';

export class ScenarioComparisonTileRequest extends TileRequest {
  @IsString()
  scenarioIdA!: string;

  @IsString()
  scenarioIdB!: string;

  @IsOptional()
  bbox?: BBox;
}
