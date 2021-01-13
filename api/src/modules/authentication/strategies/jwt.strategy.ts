import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  AuthenticationService,
  JwtDataPayload,
} from 'modules/authentication/authentication.service';

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
   * Validate that the email in the JWT payload's `sub` property matches that of
   * an existing user, and that the token was not revoked (removed from the list
   * of issued tokens).
   */
  public async validate({ sub: email, tokenId }: JwtDataPayload) {
    const user = await this.usersService.findByEmail(email);
    const token = await this.authenticationService.findTokenById(tokenId);

    if (!user || !token) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
