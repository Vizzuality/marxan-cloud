import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from 'modules/users/user.entity';
import { UsersService } from 'modules/users/users.service';
import { AppConfig } from 'utils/config.utils';
import { hash, compare } from 'bcrypt';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

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
 * JWT payload
 */
export interface JwtAppPayload {
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Validate that an active user matching the `email` provided exists, and that
   * the password provided compares with the hashed password stored for the
   * user.
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
   * @todo Allow to set all of a user's data on signup
   * @todo Implement email verification
   */
  async createUser(signupDto: { username: string; password: string }) {
    const user = new User();
    user.passwordHash = await hash(signupDto.password, 10);
    user.email = signupDto.username;
    this.usersRepository.save(user);
  }

  /**
   * Issue a signed JTW token
   */
  async login(user: Partial<User>): Promise<AccessToken> {
    const payload = { email: user.email, sub: user.email };
    return {
      user: this.usersService.getSanitizedUserMetadata(user),
      accessToken: this.jwtService.sign(payload, {
        expiresIn: AppConfig.get('auth.jwt.expiresIn', '2h'),
      }),
    };
  }
}
