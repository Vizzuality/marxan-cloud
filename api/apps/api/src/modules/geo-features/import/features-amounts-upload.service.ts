import { Injectable } from '@nestjs/common';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { featureAmountCsvParser } from '@marxan-api/modules/geo-features/import/csv.parser';
import { FeatureAmountCSVDto } from '@marxan-api/modules/geo-features/dto/feature-amount-csv.dto';
import { FeatureAmountUploadRegistry } from '@marxan-api/modules/geo-features/import/features-amounts-upload-registry.api.entity';
import {
  overlappingFeatures,
  unknownPuids,
} from '@marxan-api/modules/geo-features/geo-features.service';
import { isLeft, left, right } from 'fp-ts/Either';
import { FeatureImportEventsService } from '@marxan-api/modules/geo-features/import/feature-import.events';

@Injectable()
export class FeatureAmountUploadService {
  constructor(
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly geoEntityManager: EntityManager,
    @InjectEntityManager(DbConnections.default)
    private readonly apiEntityManager: EntityManager,
    private readonly events: FeatureImportEventsService,
  ) {}

  async saveCsvToRegistry(data: {
    fileBuffer: Buffer;
    projectId: string;
    userId: string;
  }): Promise<any> {
    try {
      await this.events.registerEvent(this.events.submit(), data);

      const parsedFile = await featureAmountCsvParser(data.fileBuffer);

      const { featureNames, puids } = this.getFeatureNamesAndPuids(parsedFile);
      if (await this.areFeaturesAlreadyPresent(data.projectId, featureNames)) {
        return left(overlappingFeatures);
      }
      if (!(await this.validateMaxPuidForProject(data.projectId, puids))) {
        return left(unknownPuids);
      }
      const importedRegistry = await this.saveFeaturesToRegistry(
        parsedFile,
        data.projectId,
        data.userId,
      );
      await this.events.registerEvent(this.events.finish(), data);
      return right(importedRegistry);
    } catch (e) {
      await this.events.registerEvent(this.events.fail(), e);
      if (isLeft(e)) {
        return e;
      }
      throw e;
    }
  }

  private async saveFeaturesToRegistry(
    features: FeatureAmountCSVDto[],
    projectId: string,
    userId: string,
  ): Promise<FeatureAmountUploadRegistry> {
    return this.apiEntityManager
      .getRepository(FeatureAmountUploadRegistry)
      .save({
        projectId,
        userId,
        uploadedFeatures: features,
      });
  }

  private async areFeaturesAlreadyPresent(
    projectId: string,
    featureNames: string[],
  ): Promise<boolean> {
    const featuresInDB = await this.apiEntityManager
      .createQueryBuilder()
      .select('features.feature_class_name')
      .from('features', 'features')
      .where('features.project_id = :projectId', { projectId })
      .andWhere('features.feature_class_name IN (:...featureNames)', {
        featureNames,
      })
      .distinct(true)
      .getMany();

    return !!featuresInDB.length;
  }

  private async validateMaxPuidForProject(
    projectId: string,
    puids: number[],
  ): Promise<boolean> {
    const maxInputPuid = Math.max(...puids);
    const maxDbPuid = await this.geoEntityManager
      .createQueryBuilder()
      .from('projects_pu', 'pu')
      .select('MAX(pu.puid)', 'maxPuid')
      .where('pu.project_id = :projectId', { projectId })
      .getRawOne();

    return maxInputPuid <= maxDbPuid.maxPuid;
  }

  private getFeatureNamesAndPuids(
    parsedCsv: FeatureAmountCSVDto[],
  ): { featureNames: string[]; puids: number[] } {
    const { featureNames, puids } = parsedCsv.reduce(
      (acc, dto) => {
        acc.featureNames.add(dto.featureName);
        acc.puids.add(dto.puid);
        return acc;
      },
      {
        featureNames: new Set<string>(),
        puids: new Set<number>(),
      },
    );

    return { featureNames: Array.from(featureNames), puids: Array.from(puids) };
  }
}
