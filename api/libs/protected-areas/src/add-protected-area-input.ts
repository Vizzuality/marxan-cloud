import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
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
  scenarioId!: string;

  @IsUUID()
  projectId!: string;

  @ValidateNested()
  @Type(() => Shapefile)
  shapefile!: Shapefile;

  @IsOptional()
  @IsString()
  name?: string;
}
