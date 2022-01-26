import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { User } from './user.api.entity';
import { UsersService } from './users.service';
import { AuthenticationModule } from '@marxan-api/modules/authentication/authentication.module';
import { AccessControlModule } from '@marxan-api/modules/access-control';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthenticationModule),
    AccessControlModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
