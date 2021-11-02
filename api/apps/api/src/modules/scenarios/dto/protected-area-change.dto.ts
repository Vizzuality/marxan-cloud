import {
  IsBoolean,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProtectedAreaChangeDto {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty()
  @IsBoolean()
  selected!: boolean;
}

export class ProtectedAreasChangeDto {
  @ApiProperty()
  @Type(() => ProtectedAreaChangeDto)
  @ValidateNested({ each: true })
  areas!: ProtectedAreaChangeDto[];

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(100)
  threshold!: number;
}
