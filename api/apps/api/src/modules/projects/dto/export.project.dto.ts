import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

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
