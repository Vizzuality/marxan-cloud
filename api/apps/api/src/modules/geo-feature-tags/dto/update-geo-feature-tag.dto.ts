import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, Validate } from 'class-validator';
import { IsValidTagNameValidator } from '@marxan-api/modules/geo-feature-tags/validators/is-valid-tag-name.custom.validator';

export const tagMaxlength = 30;

export const tagMaxLengthErrorMessage = `A tag should not be longer than ${tagMaxlength} characters`;

export class UpdateGeoFeatureTagDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'The Tag cannot not be empty' })
  @Validate(IsValidTagNameValidator)
  @MaxLength(tagMaxlength, {
    message: tagMaxLengthErrorMessage,
  })
  tagName!: string;
}
