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
    description: 'ID of the project',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  id!: string;
}
