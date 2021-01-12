import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { AuthenticationService } from 'modules/authentication/authentication.service';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'modules/users/users.service';
import { AppConfig } from 'utils/config.utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: AppConfig.get('auth.jwt.secret'),
    });
  }

  /**
   * Validate that the email in the JWT's payload matches that of an existing
   * user.
   *
   * @debt We should add the ability to revoke tokens and deny authorization
   * if the token being presented has been revoked.
   */
  public async validate({
    email,
    tokenId,
  }: {
    email: string;
    tokenId: string;
  }) {
    const user = await this.usersService.findByEmail(email);
    const token = await this.authenticationService.findTokenById(tokenId);

    if (!user || !token) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
