import { forwardRef, Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'modules/users/user.api.entity';

import { UsersModule } from 'modules/users/users.module';
import { AppConfig } from 'utils/config.utils';
import { IssuedAuthnToken } from './issued-authn-token.api.entity';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ApiEventsModule } from 'modules/api-events/api-events.module';

export const logger = new Logger('Authentication');

@Module({
  imports: [
    ApiEventsModule,
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.register({
      secret: AppConfig.get('auth.jwt.secret'),
      signOptions: { expiresIn: AppConfig.get('auth.jwt.expiresIn', '2h') },
    }),
    TypeOrmModule.forFeature([User, IssuedAuthnToken]),
  ],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy],
  controllers: [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
