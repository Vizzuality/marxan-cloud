import {
  IsBoolean,
  IsInt,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProtectedAreaChangeDto {
  @ApiProperty()
  @IsString() // TODO could be uuid (custom PA) or IUCN Category enum
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
