import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequestWithAuthenticatedUser } from 'app.controller';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';

import {
  AccessToken,
  AuthenticationService,
} from 'modules/authentication/authentication.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('/auth')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  @ApiCreatedResponse({
    type: 'AccessToken',
  })
  async login(
    @Request() req: RequestWithAuthenticatedUser,
    @Body(new ValidationPipe()) _dto: LoginDto,
  ): Promise<AccessToken> {
    return this.authenticationService.login(req.user);
  }

  @Post('sign-up')
  @ApiOperation({ description: 'Sign up for a MarxanCloud account.' })
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  async signUp(
    @Request() _req: Request,
    @Body(new ValidationPipe()) signupDto: SignUpDto,
  ): Promise<void> {
    await this.authenticationService.createUser(signupDto);
  }

  /**
   * @debt Make sure (and add e2e tests to check for regressions) that we
   * gracefully handle situations where a user's username has changed between
   * the time the JWT token being presented was issued and the attempt to
   * refresh the JWT.
   */
  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  @ApiOperation({
    description:
      'Request a fresh JWT token, given a still-valid one for the same user; no request payload is required: the user id is read from the JWT token presented.',
    summary: 'Refresh JWT token',
    operationId: 'refresh-token',
  })
  @ApiCreatedResponse({
    type: 'AccessToken',
  })
  @ApiUnauthorizedResponse()
  async refreshToken(
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<AccessToken> {
    return this.authenticationService.login(req.user);
  }
}
