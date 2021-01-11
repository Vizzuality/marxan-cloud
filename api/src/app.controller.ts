import {
  Controller,
  Get,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  AccessToken,
  AuthenticationService,
} from 'modules/authentication/authentication.service';
import { LocalAuthGuard } from 'modules/authentication/local-auth.guard';
import { User } from 'modules/users/user.entity';
import { inspect } from 'util';
import { AppService } from './app.service';

// Request object augmented with user data
export interface RequestWithAuthenticatedUser extends Request {
  user: User;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<AccessToken> {
    Logger.debug(inspect(req.user));
    return this.authenticationService.login(req.user);
  }
}
