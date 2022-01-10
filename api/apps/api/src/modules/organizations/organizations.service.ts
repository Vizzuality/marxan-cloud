import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateOrganizationDTO } from './dto/create.organization.dto';
import { UpdateOrganizationDTO } from './dto/update.organization.dto';
import { Organization } from './organization.api.entity';

import * as faker from 'faker';
import { UsersService } from '@marxan-api/modules/users/users.service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';
import { AppConfig } from '@marxan-api/utils/config.utils';

const organizationFilterKeyNames = ['name'] as const;
type OrganizationFilterKeys = keyof Pick<
  Organization,
  typeof organizationFilterKeyNames[number]
>;
type OrganizationFilters = Record<OrganizationFilterKeys, string[]>;

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
    super(repository, 'organization', 'organizations', {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
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

  /**
   * Apply service-specific filters.
   */
  setFilters(
    query: SelectQueryBuilder<Organization>,
    filters: OrganizationFilters,
    _info?: AppInfoDTO,
  ): SelectQueryBuilder<Organization> {
    this._processBaseFilters<OrganizationFilters>(
      query,
      filters,
      organizationFilterKeyNames,
    );
    return query;
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
     *
     * @TODO Figure out what's the best way to re-enable eslint rule
     */
    const organization = await super.setDataCreate(create, info);
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    organization.createdBy = info?.authenticatedUser?.id!;
    return organization;
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
