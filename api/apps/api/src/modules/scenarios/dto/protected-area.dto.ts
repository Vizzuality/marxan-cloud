import { IsBoolean, IsEnum, IsString, IsUUID } from 'class-validator';
import { ProtectedAreaKind } from '../protected-area';

export class ProtectedAreaDto {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;

  @IsEnum(ProtectedAreaKind)
  kind!: ProtectedAreaKind;

  @IsBoolean()
  selected!: boolean;
}
