import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { isDefined } from '@marxan/utils';
import { UserService } from './user.service';
import { Mailer } from './mailer';
import { TokenFactory } from './token.factory';
import { Token } from './token';
import { RecoveryTokenRepository } from './recovery-token.repository';

export const tokenInvalid = Symbol('token invalid');
type TokenInvalid = typeof tokenInvalid;

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly mailer: Mailer,
    private readonly tokenFactory: TokenFactory,
    private readonly users: UserService,
    private readonly tokens: RecoveryTokenRepository,
  ) {}

  async resetPassword(email: string): Promise<void> {
    const userId = await this.users.findUserId(email);
    if (!userId) {
      return;
    }
    const token = await this.tokenFactory.create(userId);
    await this.tokens.save(token);
    await this.mailer.sendRecoveryEmail(userId, token.value);
  }

  async changePassword(
    resetToken: string,
    newPassword: string,
    currentDate: Date = new Date(),
  ): Promise<Either<TokenInvalid, void>> {
    const token = await this.tokens.findAndDeleteToken(resetToken);
    if (!this.isTokenValid(token, resetToken)) {
      return left(tokenInvalid);
    }
    if (this.isTokenExpired(currentDate, token)) {
      return left(tokenInvalid);
    }
    const userId = token.userId;

    await this.users.setUserPassword(userId, newPassword);
    await this.users.logoutUser(userId);
    await this.mailer.sendPasswordChangedConfirmation(userId);
    return right(void 0);
  }

  private isTokenExpired(currentDate: Date, token: Token) {
    return currentDate >= token.expiredAt;
  }

  private isTokenValid(
    token: Token | undefined,
    resetToken: string,
  ): token is Token {
    return (
      isDefined(token) && isDefined(token.value) && token.value === resetToken
    );
  }
}
