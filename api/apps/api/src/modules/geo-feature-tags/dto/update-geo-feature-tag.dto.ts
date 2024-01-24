import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Validate } from 'class-validator';
import { IsValidTagNameValidator } from '@marxan-api/modules/geo-feature-tags/validators/is-valid-tag-name.custom.validator';
import { Transform } from 'class-transformer';

export const tagMaxlength = 30;

export const tagMaxLengthErrorMessage = `A tag should not be longer than ${tagMaxlength} characters`;

export class UpdateGeoFeatureTagDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'The Tag cannot not be empty' })
  @IsString()
  @Validate(IsValidTagNameValidator)
  @Transform((value: string): string => value.trim())
  @MaxLength(tagMaxlength, {
    message: tagMaxLengthErrorMessage,
  })
  tagName!: string;
}
