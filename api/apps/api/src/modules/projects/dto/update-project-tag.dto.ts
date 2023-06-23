import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, Validate } from 'class-validator';
import { IsValidTagNameValidator } from '@marxan-api/modules/geo-feature-tags/validators/is-valid-tag-name.custom.validator';
import {
  tagMaxlength,
  tagMaxLengthErrorMessage,
} from '@marxan-api/modules/geo-feature-tags/dto/update-geo-feature-tag.dto';

export class UpdateProjectTagDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'The Tag cannot not be empty' })
  @Validate(IsValidTagNameValidator)
  @MaxLength(tagMaxlength, {
    message: tagMaxLengthErrorMessage,
  })
  tagName!: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'The Tag cannot not be empty' })
  @Validate(IsValidTagNameValidator)
  @MaxLength(tagMaxlength, {
    message: tagMaxLengthErrorMessage,
  })
  updatedTagName!: string;
}
