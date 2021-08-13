import { IsBoolean, IsInt, IsNumber } from 'class-validator';

export type ExecutionResult = ResultRow[];

export class ResultRow {
  @IsInt()
  runId!: number;

  @IsNumber()
  score!: number;

  @IsNumber()
  cost!: number;

  @IsInt()
  planningUnits!: number;

  @IsNumber()
  connectivity!: number;

  @IsNumber()
  connectivityTotal!: number;

  @IsNumber()
  connectivityIn!: number;

  @IsNumber()
  connectivityEdge!: number;

  @IsNumber()
  connectivityOut!: number;

  @IsNumber()
  connectivityInFraction!: number;

  @IsNumber()
  penalty!: number;

  @IsNumber()
  shortfall!: number;

  @IsNumber()
  missingValues!: number;

  @IsNumber()
  mpm!: number;

  @IsBoolean()
  best!: boolean;

  @IsBoolean()
  distinctFive!: boolean;
}
