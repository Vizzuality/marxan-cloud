import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class RequestProjectExportBodyDto {
  @ApiProperty({
    description: 'Array of ids of scenarios to be exported',
    isArray: true,
    type: 'string',
    example: [
      'c214c6b9-1683-4b95-9221-8e378932fad1',
      '873c952c-86e7-4fee-b2d8-500c3f72ad80',
    ],
  })
  @IsUUID(4, { each: true })
  scenarioIds!: string[];
}

export class RequestProjectExportResponseDto {
  @ApiProperty({
    description: 'ID of the export',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  id!: string;
}

export class GetLatestExportResponseDto {
  @ApiProperty({
    description: 'ID of the export',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  exportId!: string;

  @ApiProperty({
    description: 'ID of the user who launched the export',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  userId!: string;

  @ApiProperty({
    description: 'Export creation timestamp',
  })
  createdAt!: Date;
}

export class GetLatestExportsResponseDto {
  @ApiProperty({ type: GetLatestExportResponseDto, isArray: true })
  exports!: GetLatestExportResponseDto[];
}

export class RequestProjectCloneResponseDto {
  @ApiProperty({
    description: 'ID of the export',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  exportId!: string;

  @ApiProperty({
    description: 'ID of the new project',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  projectId!: string;
}

export class RequestPublishedProjectCloneResponseDto {
  @ApiProperty({
    description: 'ID of the import',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  importId!: string;

  @ApiProperty({
    description: 'ID of the new project',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  projectId!: string;
}

export class RequestProjectImportBodyDto {
  @ApiProperty({
    description: 'Name of the new project',
    type: 'string',
    example: 'My new project!',
  })
  @IsOptional()
  @IsString()
  projectName?: string;

  @ApiProperty({
    description: 'Export zip file',
    type: 'string',
    format: 'binary',
  })
  file!: Express.Multer.File;
}

export class RequestProjectImportResponseDto {
  @ApiProperty({
    description: 'ID of the import',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  importId!: string;

  @ApiProperty({
    description: 'ID of the new project',
    example: 'dbe1a039-44d1-4e66-a02d-a3cadf691892',
  })
  projectId!: string;
}
