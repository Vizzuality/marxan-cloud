import { OutputScenariosFeaturesDataGeoEntity } from '@marxan/marxan-output';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class ScenarioFeatureRunData
  implements Omit<OutputScenariosFeaturesDataGeoEntity, `id`>
{
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  totalArea?: number;

  @IsUUID()
  featureScenarioId!: string;

  @IsInt()
  @IsNumber()
  occurrences?: number;

  @IsInt()
  runId!: number;

  @IsOptional()
  @IsNumber()
  separation?: number;

  @IsOptional()
  @IsBoolean()
  target?: boolean;

  @IsOptional()
  @IsNumber()
  mpm?: number;
}
