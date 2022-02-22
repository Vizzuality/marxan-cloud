import { ApiProperty } from '@nestjs/swagger';

export class RequestProjectExportResponseDto {
  @ApiProperty({
    description: 'ID of the project',
    example: '6fbec34e-04a7-4131-be14-c245f2435a6c',
  })
  id!: string;
}
