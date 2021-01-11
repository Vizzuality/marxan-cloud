import { forwardRef, Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'modules/users/user.entity';

import { UsersModule } from 'modules/users/users.module';
import { AppConfig } from 'utils/config.utils';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

export const logger = new Logger('Authentication');

@Module({
  imports: [
    forwardRef(() => UsersModule),
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: AppConfig.get('auth.jwt.secret'),
      signOptions: { expiresIn: AppConfig.get('auth.jwt.expiresIn', '2h') },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy],
  controllers: [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
