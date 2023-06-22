import { ApiProperty } from '@nestjs/swagger';

export class GetProjectTagsResponseDto {
  @ApiProperty({ description: 'List of tags in project', isArray: true })
  data!: string[];
}
