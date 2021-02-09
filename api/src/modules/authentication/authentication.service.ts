import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from 'modules/users/user.api.entity';
import { UsersService } from 'modules/users/users.service';
import { AppConfig } from 'utils/config.utils';
import { hash, compare } from 'bcrypt';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IssuedAuthnToken } from './issued-authn-token.api.entity';
import ms = require('ms');
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';

/**
 * Access token for the app: key user data and access token
 */
export interface AccessToken {
  /**
   * Whitelisted user metadata
   */
  user: Partial<User>;

  /**
   * Signed JWT
   */
  accessToken: string;
}

/**
 * JWT payload (decoded)
 */
export interface JwtDataPayload {
  /**
   * Username (user email address).
   */
  sub: string;

  /**
   * Unique id of the JWT token.
   *
   * This is used to check tokens presented to the API against revoked tokens.
   */
  tokenId: string;

  /**
   * Issued At: epoch timestamp in seconds, UTC.
   */
  iat: number;

  /**
   * Expiration time: epoch timestamp in seconds, UTC.
   */
  exp: number;
}

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(IssuedAuthnToken)
    private readonly issuedAuthnTokensRepository: Repository<IssuedAuthnToken>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Validate that an active user matching the `email` provided exists, and that
   * the password provided compares with the hashed password stored for the
   * user.
   *
   * @debt Use a named interface for the parameter types.
   */
  async validateUser({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    const isUserActive = user && user.isActive && !user.isDeleted;

    if (user && isUserActive && (await compare(password, user.passwordHash))) {
      return user;
    }
    return null;
  }

  /**
   * Create a new user from the signup data provided.
   *
   * @todo Allow to set all of a user's data on signup, if needed.
   * @todo Implement email verification.
   */
  async createUser(signupDto: SignUpDto): Promise<Partial<User>> {
    const user = new User();
    user.displayName = signupDto.displayName;
    user.passwordHash = await hash(signupDto.password, 10);
    user.email = signupDto.email;
    /**
     * @todo `isActive` should never be set to true here - we do this only in
     * dev environments until the email validation feature is ready.
     */
    if (process.env['NODE_ENV'] === 'development') {
      user.isActive = true;
    }
    const newUser = UsersService.getSanitizedUserMetadata(
      await this.usersRepository.save(user),
    );
    return newUser;
  }

  /**
   * Issue a signed JTW token, logging its issuance.
   */
  async login(user: Partial<User>): Promise<AccessToken> {
    /**
     * Before actually issuing the token, we prepare the data we need to log the
     * soon-to-be-issued token: its expiration timestamp (calculated from the
     * validity interval configured), and -below- the id assigned to the log
     * entry of the token being issued.
     */
    const tokenExpiresIn = AppConfig.get('auth.jwt.expiresIn', '2h');
    // This should always be set (either via config or falling back to the
    // default provided to `AppConfig.get()`), but I don't know how to express
    // this without multiple dispatch, so we add this check to please the type
    // checker.
    if (!tokenExpiresIn) {
      throw new InternalServerErrorException(
        'Error while issuing JWT token: invalid `expiresIn` property value.',
      );
    }

    const tokenExpiresAt = Date.now() + ms(tokenExpiresIn);

    /**
     * Here we actually log the (imminent) issuance of the token.
     */
    const issuedTokenModel = new IssuedAuthnToken();
    issuedTokenModel.exp = new Date(tokenExpiresAt);
    issuedTokenModel.userId = user.id as string;
    const issuedToken = await this.issuedAuthnTokensRepository.save(
      issuedTokenModel,
    );

    /**
     * And finally we use the db-generated unique id of the token issuance log
     * record to compose the payload of the actual token. This `tokenId` is then
     * used in the JwtStrategy to check that the token being presented by an API
     * client was not revoked.
     */
    const payload: Partial<JwtDataPayload> = {
      sub: user.email,
      tokenId: issuedToken.id,
    };

    return {
      user: UsersService.getSanitizedUserMetadata(user),
      accessToken: this.jwtService.sign(
        { ...payload },
        {
          expiresIn: AppConfig.get('auth.jwt.expiresIn', '2h'),
        },
      ),
    };
  }

  /**
   * Find token by id in the log of issued tokens.
   *
   * See documentation of the IssuedAuthnToken entity for details on these ids.
   */
  async findTokenById(tokenId: string): Promise<IssuedAuthnToken | undefined> {
    return this.issuedAuthnTokensRepository.findOne({ id: tokenId });
  }
}
