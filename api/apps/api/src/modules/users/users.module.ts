import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { User } from './user.api.entity';
import { UsersService } from './users.service';
import { AuthenticationModule } from '@marxan-api/modules/authentication/authentication.module';
import { PlatformAdminEntity } from './platform-admin/admin.api.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PlatformAdminEntity]),
    forwardRef(() => AuthenticationModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
