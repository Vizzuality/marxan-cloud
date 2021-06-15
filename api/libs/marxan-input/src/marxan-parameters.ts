import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export enum RunMode {
  SimulatedAnnealingFollowedByHeuristic = 0,
  SimulatedAnnealingFollowedByIterativeImprovement = 1,
  SimulatedAnnealingFollowedByHeuristicAndIterativeImprovement = 2,
  OnlyHeuristic = 3,
  OnlyIterativeImprovement = 4,
  HeuristicAndIterativeImprovement = 5,
  OnlySimulatedAnnealing = 6,
}

export enum IterativeImprovementType {
  Normal = 0,
  TwoStep = 1,
  Swap = 2,
  NormalFollowedByTwoStep = 3,
}

export enum HeuristicType {
  Ignored = -1,
  Richness = 0,
  Greedy = 1,
  MaxRarity = 2,
  BestRarity = 3,
  AverageRarity = 4,
  SumRarity = 5,
  ProductIrreplaceability = 6,
  SummationIrreplaceability = 7,
}

export enum ClumpType {
  Ignored = -1,
  PartialDoNotCount = 0,
  PartialCountAsHalf = 1,
  GraduatedPenalty = 3,
}

export class MarxanParameters {
  /**
   * Boundary Length Modifier
   */
  @IsOptional()
  @IsNumber()
  BLM?: number = 1;

  /**
   * Proportion of planning units ininitial reserve system
   */
  @IsOptional()
  @IsNumber()
  PROP?: number = 0.5;

  /**
   * Random seed number
   */
  @IsOptional()
  @IsNumber()
  RANDSEED?: number = -1;

  /**
   * Best score hint
   */
  @IsOptional()
  @IsNumber()
  BESTSCORE?: number = 0;

  /**
   * Number of repeat runs (or solutions)
   */
  @IsOptional()
  @IsNumber()
  NUMREPS?: number = 10;

  // Annealing

  /**
   * Number of iterations for annealing
   */
  @IsOptional()
  @IsNumber()
  NUMITNS?: number = 1000000;

  /**
   * Number of iterations for annealing
   */
  @IsOptional()
  @IsNumber()
  STARTTEMP?: number = 1000000;

  /**
   * Cooling factor for annealing
   */
  @IsOptional()
  @IsNumber()
  COOLFAC?: number = 0;

  /**
   * Number of temperature decreases for annealing
   */
  @IsOptional()
  @IsNumber()
  NUMTEMP?: number = 10000;

  // Cost Threshold

  /**
   * Cost threshold
   */
  @IsOptional()
  @IsNumber()
  COSTTHRESH?: number = 0;

  /**
   * Size of cost threshold penalty
   */
  @IsOptional()
  @IsNumber()
  THRESHPEN1?: number = 0;

  /**
   * Shape of cost threshold penalty
   */
  @IsOptional()
  @IsNumber()
  THRESHPEN2?: number = 0;

  // Program Control

  @IsOptional()
  @IsEnum(RunMode)
  RUNMODE?: RunMode = RunMode.SimulatedAnnealingFollowedByIterativeImprovement;

  /**
   * Species missing proportion
   */
  @IsOptional()
  MISSLEVEL?: number = 1;

  @IsOptional()
  @IsEnum(IterativeImprovementType)
  ITIMPTYPE?: IterativeImprovementType = IterativeImprovementType.Normal;

  @IsOptional()
  @IsEnum(HeuristicType)
  HEURTYPE?: HeuristicType = HeuristicType.Ignored;

  @IsOptional()
  @IsEnum(ClumpType)
  CLUMPTYPE?: ClumpType = ClumpType.PartialDoNotCount;
}
