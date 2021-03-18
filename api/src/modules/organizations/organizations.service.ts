import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository } from 'typeorm';
import { CreateOrganizationDTO } from './dto/create.organization.dto';
import { UpdateOrganizationDTO } from './dto/update.organization.dto';
import { Organization } from './organization.api.entity';

import * as faker from 'faker';
import { UsersService } from 'modules/users/users.service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';

@Injectable()
export class OrganizationsService extends AppBaseService<
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
    super(repository, 'organization', 'organizations');
  }

  get serializerConfig(): JSONAPISerializerConfig<Organization> {
    return {
      attributes: ['name', 'description', 'metadata', 'projects'],
      keyForAttribute: 'camelCase',
      projects: {
        ref: 'id',
        attributes: ['name', 'description', 'metadata', 'scenarios'],
        scenarios: {
          ref: 'id',
          attributes: [
            'name',
            'description',
            'type',
            'wdpaFilter',
            'wdpaThreshold',
            'numberOfRuns',
            'boundaryLengthModifier',
            'metadata',
            'status',
            'users',
            'createdAt',
            'lastModifiedAt',
          ],
        },
      },
    };
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
