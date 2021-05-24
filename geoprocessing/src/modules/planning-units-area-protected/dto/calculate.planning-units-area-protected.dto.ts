import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { IUCNCategory } from 'src/modules/protected-areas/protected-areas.geo.entity';

/**
 * @todo We have this interface partially duplicated in the api service
 * @file api/src/modules/projects/dto/create.project.dto.ts
 */
export class AreaProtectedForPlanningUnitsJob {
  @IsUUID(4)
  scenarioId!: string;

  @IsOptional()
  @IsArray()
  @IsEnum(IUCNCategory, { each: true })
  wdpaIucnCategories?: IUCNCategory[];

  @IsUUID(4, { each: true })
  customProtectedAreaIds?: string[];

  @IsInt()
  @Min(0)
  @Max(100)
  wdpaThreshold?: number;
}
