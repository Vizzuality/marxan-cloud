import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class FeatureAmountCSVDto {
  @IsDefined()
  @IsInt()
  @IsPositive()
  puid: number;

  @IsString()
  @IsNotEmpty()
  featureName: string;

  @Min(0)
  amount: number;

  constructor(data: any) {
    this.puid = data.puid;
    this.featureName = data.featureName;
    this.amount = data.amount;
  }
}
