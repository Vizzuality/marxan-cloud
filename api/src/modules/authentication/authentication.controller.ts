import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestWithAuthenticatedUser } from 'app.controller';

import {
  AccessToken,
  AuthenticationService,
} from 'modules/authentication/authentication.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('/auth')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<AccessToken> {
    return this.authenticationService.login(req.user);
  }

  @Post('sign-up')
  async signUp(
    @Request() req: Request,
    @Body(new ValidationPipe())
    signupDto: { username: string; password: string },
  ) {
    await this.authenticationService.createUser(signupDto);
  }
}
