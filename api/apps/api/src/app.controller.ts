import { Controller, Request } from '@nestjs/common';
import { User } from 'modules/users/user.api.entity';
import { AppService } from './app.service';

// Request object augmented with user data
export interface RequestWithAuthenticatedUser extends Request {
  user: User;
}

@Controller()
export class AppController {
  constructor(private readonly _service: AppService) {}
}
