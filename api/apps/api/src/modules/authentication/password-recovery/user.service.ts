import { Injectable } from '@nestjs/common';
import { UsersService } from '@marxan-api/modules/users/users.service';
import { AuthenticationService } from '@marxan-api/modules/authentication/authentication.service';

export abstract class UserService {
  abstract findUserId(email: string): Promise<string | undefined>;

  abstract setUserPassword(userId: string, password: string): Promise<void>;

  abstract logoutUser(userId: string): Promise<void>;
}

@Injectable()
export class UserServiceAdapter implements UserService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async findUserId(email: string): Promise<string | undefined> {
    const user = await this.usersService.findByEmail(email);
    return user?.id;
  }

  async logoutUser(userId: string): Promise<void> {
    await this.authenticationService.invalidateAllTokensOfUser(userId);
  }

  async setUserPassword(userId: string, password: string): Promise<void> {
    await this.usersService.updatePassword(userId, password);
  }
}
