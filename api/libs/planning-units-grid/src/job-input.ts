import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Shapefile {
  @IsString()
  path!: string;
  @IsString()
  filename!: string;
  @IsString()
  destination!: string;
}

export class JobInput {
  @IsUUID()
  requestId!: string;

  @ValidateNested()
  @Type(() => Shapefile)
  shapefile!: Shapefile;
}
