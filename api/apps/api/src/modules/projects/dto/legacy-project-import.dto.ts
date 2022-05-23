import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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

export class RunLegacyProjectImportResponseDto {
  @ApiProperty({
    description: 'ID of the project',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  projectId!: string;
}
