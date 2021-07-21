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

export class MarxanParametersDefaults {
  BLM = 1;
  PROP = 0.5;
  RANDSEED = -1;
  BESTSCORE = 0;
  NUMREPS = 10;
  NUMITNS = 1000000;
  STARTTEMP = 1000000;
  COOLFAC = 0;
  NUMTEMP = 10000;
  COSTTHRESH = 0;
  THRESHPEN1 = 0;
  THRESHPEN2 = 0;
  RUNMODE = RunMode.SimulatedAnnealingFollowedByIterativeImprovement;
  MISSLEVEL = 1;
  ITIMPTYPE = IterativeImprovementType.Normal;
  HEURTYPE = HeuristicType.Ignored;
  CLUMPTYPE = ClumpType.PartialDoNotCount;
}

const marxanDefaults = new MarxanParametersDefaults();

export class MarxanParameters {
  /**
   * Boundary Length Modifier
   */
  @IsOptional()
  @IsNumber()
  BLM?: number = marxanDefaults.BLM;

  /**
   * Proportion of planning units ininitial reserve system
   */
  @IsOptional()
  @IsNumber()
  PROP?: number = marxanDefaults.PROP;

  /**
   * Random seed number
   */
  @IsOptional()
  @IsNumber()
  RANDSEED?: number = marxanDefaults.RANDSEED;

  /**
   * Best score hint
   */
  @IsOptional()
  @IsNumber()
  BESTSCORE?: number = marxanDefaults.BESTSCORE;

  /**
   * Number of repeat runs (or solutions)
   */
  @IsOptional()
  @IsNumber()
  NUMREPS?: number = marxanDefaults.NUMREPS;

  // Annealing

  /**
   * Number of iterations for annealing
   */
  @IsOptional()
  @IsNumber()
  NUMITNS?: number = marxanDefaults.NUMITNS;

  /**
   * Number of iterations for annealing
   */
  @IsOptional()
  @IsNumber()
  STARTTEMP?: number = marxanDefaults.STARTTEMP;

  /**
   * Cooling factor for annealing
   */
  @IsOptional()
  @IsNumber()
  COOLFAC?: number = marxanDefaults.COOLFAC;

  /**
   * Number of temperature decreases for annealing
   */
  @IsOptional()
  @IsNumber()
  NUMTEMP?: number = marxanDefaults.NUMTEMP;

  // Cost Threshold

  /**
   * Cost threshold
   */
  @IsOptional()
  @IsNumber()
  COSTTHRESH?: number = marxanDefaults.COSTTHRESH;

  /**
   * Size of cost threshold penalty
   */
  @IsOptional()
  @IsNumber()
  THRESHPEN1?: number = marxanDefaults.THRESHPEN1;

  /**
   * Shape of cost threshold penalty
   */
  @IsOptional()
  @IsNumber()
  THRESHPEN2?: number = marxanDefaults.THRESHPEN2;

  // Program Control

  @IsOptional()
  @IsEnum(RunMode)
  RUNMODE?: RunMode = marxanDefaults.RUNMODE;

  /**
   * Species missing proportion
   */
  @IsOptional()
  MISSLEVEL?: number = marxanDefaults.MISSLEVEL;

  @IsOptional()
  @IsEnum(IterativeImprovementType)
  ITIMPTYPE?: IterativeImprovementType = marxanDefaults.ITIMPTYPE;

  @IsOptional()
  @IsEnum(HeuristicType)
  HEURTYPE?: HeuristicType = marxanDefaults.HEURTYPE;

  @IsOptional()
  @IsEnum(ClumpType)
  CLUMPTYPE?: ClumpType = marxanDefaults.CLUMPTYPE;
}
