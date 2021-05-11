import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationsController } from './organizations.controller';
import { Organization } from './organization.api.entity';
import { OrganizationsService } from './organizations.service';
import { UsersModule } from 'modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Organization]), UsersModule],
  providers: [OrganizationsService],
  controllers: [OrganizationsController],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
