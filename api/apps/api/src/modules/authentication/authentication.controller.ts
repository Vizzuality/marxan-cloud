import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequestWithAuthenticatedUser } from '@marxan-api/app.controller';
import { JwtAuthGuard } from '@marxan-api/guards/jwt-auth.guard';

import {
  AccessToken,
  AuthenticationService,
  emailAlreadyInUseError,
  unknownError,
} from '@marxan-api/modules/authentication/authentication.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UserAccountValidationDTO } from './dto/user-account.validation.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { IsMissingAclImplementation } from '@marxan-api/decorators/acl.decorator';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { isLeft } from 'fp-ts/Either';

@UseGuards(ThrottlerGuard)
@Throttle(25, 60)
@Controller('/auth')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @UseGuards(LocalAuthGuard)
  @ApiOperation({
    description: 'Sign user in, issuing a JWT token.',
    summary: 'Sign user in',
    operationId: 'sign-in',
  })
  @Post('sign-in')
  @ApiCreatedResponse({
    type: 'AccessToken',
  })
  async login(
    @Request()
    req: RequestWithAuthenticatedUser,
    @Body(new ValidationPipe()) _dto: LoginDto,
  ): Promise<AccessToken> {
    return this.authenticationService.login(req.user);
  }

  @IsMissingAclImplementation()
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @ApiOperation({
    description:
      'Sign user out of all their current sessions by invalidating all the JWT tokens issued to them',
    summary: 'Sign user out',
    operationId: 'sign-out',
  })
  @Post('sign-out')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async logout(@Request() req: RequestWithAuthenticatedUser): Promise<void> {
    await this.authenticationService.invalidateAllTokensOfUser(req.user.id);
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
    const result = await this.authenticationService.createUser(signupDto);
    if (isLeft(result)) {
      switch (result.left) {
        case emailAlreadyInUseError:
          throw new ConflictException(
            `Email: ${signupDto.email} is already in use`,
          );
        case unknownError:
          throw new InternalServerErrorException(
            `Unknown error when signing up with this DTO: ${signupDto}`,
          );
      }
    }
  }

  @Post('validate')
  @ApiOperation({ description: 'Confirm an activation token for a new user.' })
  @ApiOkResponse()
  async confirm(
    @Body(new ValidationPipe()) validationDto: UserAccountValidationDTO,
  ): Promise<void> {
    await this.authenticationService.validateActivationToken(validationDto);
  }

  /**
   * @debt Make sure (and add e2e tests to check for regressions) that we
   * gracefully handle situations where a user's username has changed between
   * the time the JWT token being presented was issued and the attempt to
   * refresh the JWT.
   */
  @IsMissingAclImplementation()
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
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
