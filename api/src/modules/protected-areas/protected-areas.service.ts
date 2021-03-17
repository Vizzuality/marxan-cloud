import { BaseServiceResource } from 'types/resource.interface';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository } from 'typeorm';
import { CreateProtectedAreaDTO } from './dto/create.protected-area.dto';
import { UpdateProtectedAreaDTO } from './dto/update.protected-area.dto';
import { ProtectedArea } from './protected-area.geo.entity';

import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';

export const protectedAreaResource: BaseServiceResource = {
  className: 'ProtectedArea',
  name: {
    singular: 'protected_area',
    plural: 'protected_areas',
  },
};

@Injectable()
export class ProtectedAreasService extends AppBaseService<
  ProtectedArea,
  CreateProtectedAreaDTO,
  UpdateProtectedAreaDTO,
  AppInfoDTO
> {
  private readonly logger = new Logger(ProtectedAreasService.name);

  constructor(
    @InjectRepository(ProtectedArea, 'geoprocessingDB')
    protected readonly repository: Repository<ProtectedArea>,
  ) {
    super(repository, 'protected_area', 'protected_areas');
  }

  get serializerConfig(): JSONAPISerializerConfig<ProtectedArea> {
    return {
      attributes: [
        'wdpaId',
        'fullName',
        'iucnCategory',
        'shapeLength',
        'shapeArea',
        'countryId',
        'status',
        'designation',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async importProtectedAreaShapefile(
    _file: Express.Multer.File,
  ): Promise<ProtectedArea> {
    return new ProtectedArea();
  }
}
