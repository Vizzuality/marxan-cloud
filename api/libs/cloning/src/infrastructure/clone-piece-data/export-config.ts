import 'reflect-metadata';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ClonePiece } from '../../domain/clone-piece';
import { ResourceKind } from '../../domain/resource.kind';

class CommonFields {
  @IsString()
  version!: string;

  @IsEnum(ResourceKind)
  resourceKind!: ResourceKind;

  @IsUUID(4)
  resourceId!: string;

  @IsArray()
  @IsEnum(ClonePiece, { each: true })
  pieces!: ClonePiece[];

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

class ScenarioMetadata {
  @IsUUID(4)
  id!: string;

  @IsString()
  name!: string;
}

export class ProjectExportConfigContent extends CommonFields {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScenarioMetadata)
  scenarios!: ScenarioMetadata[];
}

export class ScenarioExportConfigContent extends CommonFields {
  @IsUUID(4)
  projectId!: string;
}

export type ExportConfigContent =
  | ProjectExportConfigContent
  | ScenarioExportConfigContent;

export interface ExportConfigRelativePathsType {
  config: string;
}

export const ExportConfigRelativePaths: ExportConfigRelativePathsType = {
  config: 'config.json',
};
