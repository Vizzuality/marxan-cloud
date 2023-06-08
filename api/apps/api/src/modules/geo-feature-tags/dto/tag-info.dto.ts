import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, Validate } from 'class-validator';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { IsValidTagNameValidator } from '@marxan-api/modules/geo-feature-tags/validators/is-valid-tag-name.custom.validator';

const tagMaxlength = AppConfig.get<number>('marxan.maxTagLength');

export class TagInfoDTO {
  @ApiProperty()
  @IsNotEmpty()
  @Validate(IsValidTagNameValidator)
  @MaxLength(tagMaxlength, {
    message: `tagName length should not be longer than ${tagMaxlength} characters`,
  })
  tagName!: string;
}
