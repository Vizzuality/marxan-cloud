import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { BaseService } from 'nestjs-base-service';
import { Repository } from 'typeorm';
import { CreateOrganizationDTO } from './dto/create.organization.dto';
import { UpdateOrganizationDTO } from './dto/update.organization.dto';
import { Organization } from './organization.api.entity';

import JSONAPISerializer = require('jsonapi-serializer');

import * as faker from 'faker';
import { UsersService } from 'modules/users/users.service';

@Injectable()
export class OrganizationsService extends BaseService<
  Organization,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(Organization)
    protected readonly repository: Repository<Organization>,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    super(repository, 'organization');
    this.serializer = new JSONAPISerializer.Serializer('organizations', {
      attributes: ['name', 'description'],
      keyForAttribute: 'camelCase',
    });
  }

  serializer;

  async serialize(entities: Organization[]) {
    return this.serializer.serialize(entities);
  }

  async fakeFindOne(_id: string): Promise<Organization> {
    const organization = {
      ...new Organization(),
      id: faker.random.uuid(),
      name: faker.lorem.words(5),
      description: faker.lorem.sentence(),
    };
    return organization;
  }

  async findAll(): Promise<Organization[]> {
    return this.repository.find();
  }

  findOne(id: string): Promise<Organization | undefined> {
    return this.repository.findOne(id);
  }

  async setDataCreate(
    create: CreateOrganizationDTO,
    info?: AppInfoDTO,
  ): Promise<Organization> {
    /**
     * @debt Temporary setup. I think we should remove TimeUserEntityMetadata
     * from entities and just use a separate event log, and a view to obtain the
     * same information (who created an entity and when, and when it was last
     * modified) from that log, kind of event sourcing way.
     */
    const organization = await super.setDataCreate(create, info);
    organization.createdBy = info?.authenticatedUser?.id!;
    return organization;
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
