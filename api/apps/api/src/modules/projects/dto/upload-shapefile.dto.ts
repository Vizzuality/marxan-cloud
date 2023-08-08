import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Validate } from 'class-validator';
import {
  tagMaxlength,
  tagMaxLengthErrorMessage,
} from '@marxan-api/modules/geo-feature-tags/dto/update-geo-feature-tag.dto';
import { IsValidTagNameValidator } from '@marxan-api/modules/geo-feature-tags/validators/is-valid-tag-name.custom.validator';

export class UploadShapefileDTO {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Validate(IsValidTagNameValidator)
  @MaxLength(tagMaxlength, {
    message: tagMaxLengthErrorMessage,
  })
  tagName?: string;

  /**
   * `file` data is extracted via the @UploadedFile decorator in the controller;
   *  the DTO includes this property to document the request body.
   */
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
