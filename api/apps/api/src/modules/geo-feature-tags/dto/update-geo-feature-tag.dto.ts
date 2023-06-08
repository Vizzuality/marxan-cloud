import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { TagInfoDTO } from '@marxan-api/modules/geo-feature-tags/dto/tag-info.dto';
import { Type } from 'class-transformer';

export class UpdateGeoFeatureTagDTO {
  @ApiProperty()
  @IsUUID()
  projectId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TagInfoDTO)
  tagInfo!: TagInfoDTO;
}
