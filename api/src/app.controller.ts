import { Controller, Get, Request } from '@nestjs/common';
import { AuthenticationService } from 'modules/authentication/authentication.service';
import { User } from 'modules/users/user.api.entity';
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
}
