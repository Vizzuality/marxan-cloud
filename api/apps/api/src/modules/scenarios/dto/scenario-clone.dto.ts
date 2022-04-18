import { ApiProperty } from '@nestjs/swagger';

export class RequestScenarioCloneResponseDto {
  @ApiProperty({
    description: 'ID of the export',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  exportId!: string;

  @ApiProperty({
    description: 'ID of the new scenario',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  scenarioId!: string;
}
