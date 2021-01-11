import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthenticationService } from 'modules/authentication/authentication.service';

@Controller('/api/v1/auth')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}
}
