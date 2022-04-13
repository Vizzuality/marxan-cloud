import { Type } from 'class-transformer';
import {
  Equals,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import 'reflect-metadata';
import { ClonePiece } from '../../domain/clone-piece';
import { ResourceKind } from '../../domain/resource.kind';
import { IsExportConfigPieces } from '../../is-export-config-pieces.decorator';

export const exportVersion = '0.1.0';

class CommonFields {
  @IsString()
  @Equals(exportVersion)
  version!: string;

  @IsEnum(ResourceKind)
  resourceKind!: ResourceKind;

  @IsUUID(4)
  resourceId!: string;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isCloning!: boolean;
}

class ScenarioMetadata {
  @IsUUID(4)
  id!: string;

  @IsString()
  name!: string;
}

class ProjectExportConfigPieces {
  @IsArray()
  @IsEnum(ClonePiece, { each: true })
  project!: ClonePiece[];

  @IsExportConfigPieces()
  scenarios!: Record<string, ClonePiece[]>;
}

export class ProjectExportConfigContent extends CommonFields {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScenarioMetadata)
  scenarios!: ScenarioMetadata[];

  @ValidateNested()
  @Type(() => ProjectExportConfigPieces)
  pieces!: ProjectExportConfigPieces;
}

export class ScenarioExportConfigContent extends CommonFields {
  @IsUUID(4)
  projectId!: string;

  @IsArray()
  @IsEnum(ClonePiece, { each: true })
  pieces!: ClonePiece[];
}

export type ExportConfigContent =
  | ProjectExportConfigContent
  | ScenarioExportConfigContent;

export const exportConfigRelativePath = 'config.json';
