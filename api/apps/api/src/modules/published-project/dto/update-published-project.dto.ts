import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { PublishProjectDto } from './publish-project.dto';

export class UpdatePublishedProjectDto extends PublishProjectDto {
  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  underModeration?: boolean;
}
