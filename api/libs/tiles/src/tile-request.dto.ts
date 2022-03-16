import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class TileRequest {
  /**
   * @description The zoom level ranging from 0 - 20
   */
  @IsInt()
  @Min(0)
  @Max(20)
  @Transform(({ value }) => Number.parseInt(value))
  z!: number;

  /**
   * @description The tile x offset on Mercator Projection
   */
  @IsInt()
  @Transform(({ value }) => Number.parseInt(value))
  x!: number;

  /**
   * @description The tile y offset on Mercator Projection
   */
  @IsInt()
  @Transform(({ value }) => Number.parseInt(value))
  y!: number;

  @IsUUID()
  @IsOptional()
  projectId?: string;
}
