import { forwardRef, ConsoleLogger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@marxan-api/modules/users/user.api.entity';

import { UsersModule } from '@marxan-api/modules/users/users.module';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { IssuedAuthnToken } from './issued-authn-token.api.entity';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import {
  Mailer,
  passwordResetPrefixProvider,
  SparkPostMailer,
  sparkPostProvider,
} from './password-recovery/mailer';
import {
  UserService,
  UserServiceAdapter,
} from './password-recovery/user.service';
import {
  CryptoTokenFactory,
  expirationOffsetProvider,
  TokenFactory,
} from './password-recovery/token.factory';
import {
  RecoveryTokenRepository,
  TypeORMRecoveryTokenRepository,
} from './password-recovery/recovery-token.repository';
import { PasswordRecoveryService } from './password-recovery/password-recovery.service';
import { PasswordRecoveryToken } from './password-recovery/password-recovery-token.api.entity';
import { PasswordRecoveryController } from './password-recovery/password-recovery.controller';

export const logger = new ConsoleLogger('Authentication');

@Module({
  imports: [
    UsersModule,
    ApiEventsModule,
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.register({
      secret: AppConfig.get('auth.jwt.secret'),
      signOptions: { expiresIn: AppConfig.get('auth.jwt.expiresIn', '2h') },
    }),
    TypeOrmModule.forFeature([User, IssuedAuthnToken, PasswordRecoveryToken]),
  ],
  providers: [
    AuthenticationService,
    LocalStrategy,
    JwtStrategy,
    passwordResetPrefixProvider,
    sparkPostProvider,
    {
      provide: Mailer,
      useClass: SparkPostMailer,
    },
    {
      provide: UserService,
      useClass: UserServiceAdapter,
    },
    expirationOffsetProvider,
    {
      provide: TokenFactory,
      useClass: CryptoTokenFactory,
    },
    {
      provide: RecoveryTokenRepository,
      useClass: TypeORMRecoveryTokenRepository,
    },
    PasswordRecoveryService,
  ],
  controllers: [AuthenticationController, PasswordRecoveryController],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
