import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator';
import { IsValidTagNameValidator } from '@marxan-api/modules/geo-feature-tags/validators/is-valid-tag-name.custom.validator';
import {
  tagMaxlength,
  tagMaxLengthErrorMessage,
} from '@marxan-api/modules/geo-feature-tags/dto/update-geo-feature-tag.dto';

export class GetProjectTagsDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Validate(IsValidTagNameValidator)
  @MaxLength(tagMaxlength, {
    message: tagMaxLengthErrorMessage,
  })
  tag?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC'], { message: 'order must be either ASC or DESC' })
  order?: string = 'ASC';
}
