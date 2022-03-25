import { IsInt, IsNumber } from 'class-validator';

export class OutputBestParsedRow {
  @IsInt()
  puid!: number;

  @IsNumber()
  solution!: number;
}
