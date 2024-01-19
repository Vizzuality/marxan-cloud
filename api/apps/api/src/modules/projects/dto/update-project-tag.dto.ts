import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Validate } from 'class-validator';
import { IsValidTagNameValidator } from '@marxan-api/modules/geo-feature-tags/validators/is-valid-tag-name.custom.validator';
import {
  tagMaxlength,
  tagMaxLengthErrorMessage,
} from '@marxan-api/modules/geo-feature-tags/dto/update-geo-feature-tag.dto';
import { Transform } from 'class-transformer';

export class UpdateProjectTagDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'The Tag cannot not be empty' })
  tagName!: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'The Tag cannot not be empty' })
  @IsString()
  @Validate(IsValidTagNameValidator)
  @Transform((value: string): string => value.trim())
  @MaxLength(tagMaxlength, {
    message: tagMaxLengthErrorMessage,
  })
  updatedTagName!: string;
}
