import { IsEnum, IsString, IsUUID } from 'class-validator';
import { ProtectedAreaKind } from './protected-area.kind';

export class ProtectedArea {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;

  @IsEnum(ProtectedAreaKind)
  kind!: ProtectedAreaKind;
}
