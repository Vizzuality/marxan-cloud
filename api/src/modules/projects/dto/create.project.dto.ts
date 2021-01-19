import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string;
}
