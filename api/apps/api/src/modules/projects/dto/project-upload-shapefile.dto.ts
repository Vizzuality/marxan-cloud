import { ApiProperty } from '@nestjs/swagger';

export class ShapefileUploadResponse {
  @ApiProperty()
  success!: boolean;
}
