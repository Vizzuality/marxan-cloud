import {
  LegacyProjectImportFileType,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { LegacyProjectImportComponentReport } from '../../legacy-project-import/application/get-legacy-project-import-errors.query';
import { LegacyProjectImportComponentStatuses } from '../../legacy-project-import/domain/legacy-project-import/legacy-project-import-component-status';

export class StartLegacyProjectImportBodyDto {
  @ApiProperty({
    description: 'Name of the project',
    example: 'Angola wildlife preservation plan',
  })
  @IsString()
  projectName!: string;

  @ApiProperty({
    description: 'description of the project',
    example: 'legacy project import description',
  })
  @IsString()
  description!: string;
}

export class StartLegacyProjectImportResponseDto {
  @ApiProperty({
    description: 'ID of the project',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  projectId!: string;

  @ApiProperty({
    description: 'ID of the scenario',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  scenarioId!: string;
}

export class AddFileToLegacyProjectImportBodyDto {
  @ApiProperty({
    description: 'Type of the file',
    example: LegacyProjectImportFileType.InputDat,
    enum: LegacyProjectImportFileType,
  })
  @IsEnum(LegacyProjectImportFileType)
  fileType!: LegacyProjectImportFileType;

  @ApiProperty({
    description: 'Export zip file',
    type: 'string',
    format: 'binary',
  })
  file!: Express.Multer.File;
}

export class AddFileToLegacyProjectImportResponseDto {
  @ApiProperty({
    description: 'ID of the project',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  projectId!: string;

  @ApiProperty({
    description: 'ID of the file',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  fileId!: string;
}

export class RunLegacyProjectImportBodyDto {
  @ApiProperty({
    description:
      'This flag is used for locking solution when importing a legacy project import',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  solutionsAreLocked: boolean = false;
}

export class RunLegacyProjectImportResponseDto {
  @ApiProperty({
    description: 'ID of the project',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  projectId!: string;
}

export class DeleteFileFromLegacyProjectImportResponseDto {
  @ApiProperty({
    description: 'ID of the project',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  projectId!: string;
}

export class GetLegacyProjectImportErrorsResponseDto {
  @ApiProperty({
    description: 'Errors and warnings of each piece',
    example: [
      {
        componentId: '6fbec34e-04a7-4131-be14-c245f2435a6c',
        kind: LegacyProjectImportPiece.ScenarioPusData,
        status: LegacyProjectImportComponentStatuses.Failed,
        errors: ['pu.dat file invalid content'],
        warnings: [],
      },
    ],
    isArray: true,
  })
  errorsAndWarnings!: LegacyProjectImportComponentReport[];
}
