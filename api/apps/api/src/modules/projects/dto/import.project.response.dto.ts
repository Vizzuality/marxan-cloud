import { ApiProperty } from '@nestjs/swagger';

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
