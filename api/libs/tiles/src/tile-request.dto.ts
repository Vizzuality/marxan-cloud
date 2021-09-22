import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class TileRequest {
  /**
   * @description The zoom level ranging from 0 - 20
   */
  @IsInt()
  @Min(0)
  @Max(20)
  @Transform((i) => Number.parseInt(i))
  z!: number;

  /**
   * @description The tile x offset on Mercator Projection
   */
  @IsInt()
  @Transform((i) => Number.parseInt(i))
  x!: number;

  /**
   * @description The tile y offset on Mercator Projection
   */
  @IsInt()
  @Transform((i) => Number.parseInt(i))
  y!: number;

  @IsUUID()
  @IsOptional()
  projectId?: string;
}
