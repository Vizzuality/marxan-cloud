import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

export class CreateUserDTO {
  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  displayName: string | null;

  @ApiPropertyOptional()
  fname?: string | null;

  @ApiPropertyOptional()
  lname?: string | null;

  @ApiProperty()
  /**
   * 18 UTF-8 characters may be at most 4*18 bytes (72 bytes), which is the
   * maximum string length that can be compared fully by bcrypt (see
   * https://www.npmjs.com/package/bcrypt#security-issues-and-concerns).
   *
   * @debt I don't think we should really limit this to 18 *characters* though.
   * If users want to set longer passphrases using mostly alphanumeric
   * characters then they should welcome to do so, as long as the *effective*
   * byte count of the chosen passphrase is at most 72.
   */
  @MaxLength(18)
  password: string;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;
}
