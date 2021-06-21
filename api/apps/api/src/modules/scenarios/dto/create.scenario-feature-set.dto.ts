import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsJSON,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { IUCNCategory } from '@marxan-api/modules/protected-areas/protected-area.geo.entity';
import { JobStatus, ScenarioType } from '../scenario.api.entity';
import { MarxanParameters } from '@marxan/marxan-input/marxan-parameters';
import { ScenarioMetadataDto } from './scenario-metadata.dto';
import { GeoFeatureSet } from '@marxan-api/modules/geo-features/geo-feature-set.api.entity';

export class CreateScenarioFeatureSetDTO extends PickType(GeoFeatureSet, ['status', 'features']) { }
