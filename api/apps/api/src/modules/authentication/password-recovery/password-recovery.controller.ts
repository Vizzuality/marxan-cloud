import { apiGlobalPrefixes } from '@marxan-api/api.config';
import {
  Body,
  Controller,
  Post,
  Headers,
  UnauthorizedException,
  Patch,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiNoContentResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { IsPassword } from '@marxan-api/modules/users/dto/is-password.decorator';
import { PasswordRecoveryService } from './password-recovery.service';

class PasswordRecoveryRequestDto {
  @IsEmail()
  @ApiProperty()
  email!: string;
}

class SetPasswordDto {
  @ApiProperty()
  @IsPassword()
  passwordConfirm!: string;
}

@Controller(`${apiGlobalPrefixes.v1}/users/me`)
@ApiTags('Authentication')
export class PasswordRecoveryController {
  constructor(
    private readonly passwordRecoveryService: PasswordRecoveryService,
  ) {}

  @Post('recover-password')
  @ApiOperation({
    description: `Request a password recovery for a user. Triggers sending an email to the user with a reset token.`,
  })
  @ApiNoContentResponse()
  requestRecovery(@Body() dto: PasswordRecoveryRequestDto) {
    // DO NOT await to prevent user enumeration
    void this.passwordRecoveryService.resetPassword(dto.email);
  }

  @Patch('reset-password')
  @ApiOperation({
    description: `Sets a new password for a user using a single use token`,
  })
  @ApiNoContentResponse()
  @ApiHeader({
    name: `Authorization`,
    example: `Bearer e5c468398038c3930f60a26b5ac66ea987203f5df2f390c13867411fc073bef3`,
    description: `An header with a token got by a user in the recovery mail`,
    required: true,
  })
  async setPassword(
    @Body() dto: SetPasswordDto,
    @Headers('Authorization') authHeader: unknown,
  ) {
    if (
      typeof authHeader !== 'string' ||
      !authHeader.toLowerCase().startsWith('bearer ')
    )
      throw new UnauthorizedException();
    const token = authHeader.substr(7, authHeader.length);
    await this.passwordRecoveryService.changePassword(
      token,
      dto.passwordConfirm,
    );
  }
}
