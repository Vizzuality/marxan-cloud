import {
  ClumpType,
  HeuristicType,
  IterativeImprovementType,
  MarxanParameters,
  RunMode,
} from '@marxan/marxan-input';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MarxanParametersDto extends MarxanParameters {
  @ApiPropertyOptional()
  BLM?: number;
  @ApiPropertyOptional()
  PROP?: number;
  @ApiPropertyOptional()
  RANDSEED?: number;
  @ApiPropertyOptional()
  BESTSCORE?: number;
  @ApiPropertyOptional()
  NUMREPS?: number;
  @ApiPropertyOptional()
  NUMITNS?: number;
  @ApiPropertyOptional()
  STARTTEMP?: number;
  @ApiPropertyOptional()
  COOLFAC?: number;
  @ApiPropertyOptional()
  NUMTEMP?: number;
  @ApiPropertyOptional()
  COSTTHRESH?: number;
  @ApiPropertyOptional()
  THRESHPEN1?: number;
  @ApiPropertyOptional()
  THRESHPEN2?: number;
  @ApiPropertyOptional({
    enum: RunMode,
    example:
      RunMode.SimulatedAnnealingFollowedByHeuristicAndIterativeImprovement,
  })
  RUNMODE?: RunMode;
  @ApiPropertyOptional()
  MISSLEVEL?: number;
  @ApiPropertyOptional({
    enum: IterativeImprovementType,
    example: IterativeImprovementType.Swap,
  })
  ITIMPTYPE?: IterativeImprovementType;
  @ApiPropertyOptional({
    enum: HeuristicType,
    example: HeuristicType.AverageRarity,
  })
  HEURTYPE?: HeuristicType;
  @ApiPropertyOptional({
    enum: ClumpType,
    example: ClumpType.PartialCountAsHalf,
  })
  CLUMPTYPE?: ClumpType;
}

export class ScenarioMetadataDto {
  @ApiPropertyOptional()
  marxanInputParameterFile?: MarxanParametersDto;
}
