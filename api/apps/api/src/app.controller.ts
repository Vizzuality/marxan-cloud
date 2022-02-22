import { Controller } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { AppService } from './app.service';

// Request object augmented with user data
export interface RequestWithAuthenticatedUser extends Request {
  user: User;
}

@Controller()
export class AppController {
  constructor(private readonly _service: AppService) {}
}
