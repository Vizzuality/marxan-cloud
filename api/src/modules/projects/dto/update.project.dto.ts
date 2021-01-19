import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDTO {
  @ApiPropertyOptional()
  name: string | null;

  @ApiPropertyOptional()
  description: string | null;
}
