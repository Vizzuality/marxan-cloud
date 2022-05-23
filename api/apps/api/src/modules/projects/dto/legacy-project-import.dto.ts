import { LegacyProjectImportFileType } from '@marxan/legacy-project-import';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class StartLegacyProjectImportBodyDto {
  @ApiProperty({
    description: 'Name of the project',
    example: 'Angola wildlife preservation plan',
  })
  @IsString()
  projectName!: string;
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

export class RunLegacyProjectImportResponseDto {
  @ApiProperty({
    description: 'ID of the project',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  projectId!: string;
}
