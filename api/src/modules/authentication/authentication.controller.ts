import {
  Body,
  Controller,
  Post,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthenticationService } from 'modules/authentication/authentication.service';

@Controller('/auth')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-up')
  async signUp(
    @Request() req: Request,
    @Body(new ValidationPipe())
    signupDto: { username: string; password: string },
  ) {
    await this.authenticationService.createUser(signupDto);
  }
}
