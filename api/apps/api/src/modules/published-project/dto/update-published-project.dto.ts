import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreatePublishProjectDto } from './publish-project.dto';

export class UpdatePublishedProjectDto extends CreatePublishProjectDto {
  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  underModeration?: boolean;
}
