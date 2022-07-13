import { DynamicModule, Module } from '@nestjs/common';
import { getEntityManagerToken, TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmPuvsprCalculationsRepository } from './repository/typeorm-puvspr-calculations.repository';
import { PuvsprCalculationsEntity } from './puvspr-calculations.geo.entity';
import {
  geoEntityManagerToken,
  PuvsprCalculationsService,
} from './puvspr-calculations.service';
import { PuvsprCalculationsRepository } from './repository/puvspr-calculations.repository';

@Module({})
export class PuvsprCalculationsModule {
  static for(geoConnectionName: string): DynamicModule {
    return {
      module: PuvsprCalculationsModule,
      imports: [
        TypeOrmModule.forFeature([PuvsprCalculationsEntity], geoConnectionName),
      ],
      providers: [
        {
          provide: geoEntityManagerToken,
          useExisting: getEntityManagerToken(geoConnectionName),
        },
        PuvsprCalculationsService,
        {
          provide: PuvsprCalculationsRepository,
          useClass: TypeOrmPuvsprCalculationsRepository,
        },
      ],
      exports: [PuvsprCalculationsService, PuvsprCalculationsRepository],
    };
  }
}
