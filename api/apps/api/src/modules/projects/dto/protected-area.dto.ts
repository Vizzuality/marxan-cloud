import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProtectedAreaDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  name?: string;
}
