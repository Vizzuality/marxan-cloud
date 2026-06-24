import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { ComponentLocation, ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ProjectFeatureGeoOperation } from '@marxan/cloning/infrastructure/clone-piece-data/project-feature-amounts-per-planning-unit';
import { FeatureAmountsPerPlanningUnitEntity } from '@marxan/feature-amounts-per-planning-unit';
import { SingleConfigFeatureValueStripped } from '@marxan/features-hash';
import { SpecificationOperation } from '@marxan/specification';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager, Repository } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

type FeaturesSelectResult = {
  featureName: string;
  isCustom: boolean;
  id: string;
};

type ProjectFeaturesSelectResult = {
  featureName: string;
  geoOperation: SingleConfigFeatureValueStripped;
};

type FeatureByIdMap = Record<string, Omit<FeaturesSelectResult, 'id'>>;

/**
 * Raw row shape returned by the streamed feature_amounts_per_planning_unit
 * query. Keys match the aliases passed to `.select`/`.addSelect`.
 */
type FeatureAmountRawRow = {
  amount: number;
  projectPuId: string;
  featureId: string;
};

@Injectable()
@PieceExportProvider()
export class ProjectFeatureAmountsPerPlanningUnitPieceExporter
  implements ExportPieceProcessor
{
  private readonly logger: Logger = new Logger(
    ProjectFeatureAmountsPerPlanningUnitPieceExporter.name,
  );

  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectRepository(ProjectsPuEntity)
    private readonly projectPusRepo: Repository<ProjectsPuEntity>,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoEntityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.ProjectFeatureAmountsPerPlanningUnit &&
      kind === ResourceKind.Project
    );
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const projectId = input.resourceId;

    /**
     * Memory efficiency (MRXNM-101, same pattern as the import side and the
     * scenario-features-data exporter MRXNM-96):
     *
     * On large projects the `feature_amounts_per_planning_unit` table holds
     * hundreds of thousands of rows (PU x feature). The previous implementation
     * loaded the whole table, built the full transformed array AND the entire
     * `JSON.stringify` string in memory before writing -> a heap spike that on
     * big projects approaches the ~4GB V8 heap wall.
     *
     * This rewrite streams the big side: the feature-amount rows are pulled from
     * a server-side cursor and transformed + written one at a time (see
     * `streamFileContent`), so the full array / JSON string is never resident.
     * The two remaining in-memory lookups do NOT scale with PU x feature:
     *   - feature properties: one row per distinct feature (tens).
     *   - project PUs (puid by project_pu_id): bounded by PU count.
     * The output file shape is byte-compatible so the (streamed, MRXNM-101)
     * importer keeps working as-is.
     */

    // Small lookup #1: properties for every feature referenced by the project's
    // feature amounts. Distinct ids are gathered server-side, so we never buffer
    // the big row set just to collect a handful of feature ids.
    const featuresById = await this.getFeaturesByIdForProjectAmounts(projectId);

    // Small lookup #2: puid by project_pu_id (bounded by project PU count).
    const projectPusById = await this.getProjectPusById(projectId);

    // Small side, computed (and validated) up front: the derived-feature geo
    // operations. Done before streaming so a thrown validation error surfaces
    // here instead of being swallowed by storeFile's try/catch (the transform
    // now runs lazily inside the file-write stream).
    const projectFeaturesGeoOperations =
      await this.getProjectFeaturesGeoOperations(projectId);

    // Big side: stream the feature-amount rows from a cursor; transform + write
    // per row.
    const amountRowStream = await this.geoEntityManager
      .createQueryBuilder(FeatureAmountsPerPlanningUnitEntity, 'fappu')
      .select('fappu.amount', 'amount')
      .addSelect('fappu.projectPuId', 'projectPuId')
      .addSelect('fappu.featureId', 'featureId')
      .where('fappu.projectId = :projectId', { projectId })
      .stream();

    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.ProjectFeatureAmountsPerPlanningUnit,
    );

    const outputFile = await this.fileRepository.saveCloningFile(
      input.exportId,
      Readable.from(
        this.streamFileContent(
          amountRowStream,
          featuresById,
          projectPusById,
          projectFeaturesGeoOperations,
        ),
      ),
      relativePath,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ProjectFeatureAmountsPerPlanningUnitPieceExporter.name} - Project - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: [new ComponentLocation(outputFile.right, relativePath)],
    };
  }

  /**
   * Streams the `{ "featureAmountsPerPlanningUnit": [...],
   * "projectFeaturesGeoOperations": [...] }` file content. Each raw feature
   * amount row is transformed and serialised on its own, joined with commas, so
   * the whole array / JSON string is never held in memory. Backpressure from the
   * file write pauses the DB cursor.
   *
   * @TODO Because the feature_amounts_per_planning_unit table is not accounted
   * for in the clean up task, it can happen that when exporting after having
   * deleted a feature, the feature info would not be found below and cause an
   * error. Because it's not clear whether deleting the feature_amount_per_pu
   * records of the dangling feature has any implications, to avoid this error
   * the missing features are discarded (skipped) here.
   */
  private async *streamFileContent(
    rowStream: Readable,
    featuresById: FeatureByIdMap,
    projectPusById: Record<string, number>,
    projectFeaturesGeoOperations: ProjectFeatureGeoOperation[],
  ): AsyncGenerator<string> {
    yield '{"featureAmountsPerPlanningUnit":[';
    let first = true;
    for await (const row of rowStream as AsyncIterable<FeatureAmountRawRow>) {
      const feature = featuresById[row.featureId];
      if (!feature) continue;

      const element = {
        amount: row.amount,
        puid: projectPusById[row.projectPuId],
        featureName: feature.featureName,
        isCustom: feature.isCustom,
      };
      yield (first ? '' : ',') + JSON.stringify(element);
      first = false;
    }
    yield `],"projectFeaturesGeoOperations":${JSON.stringify(
      projectFeaturesGeoOperations,
    )}}`;
  }

  /**
   * Resolves `featureName`/`isCustom` for every feature referenced by the
   * project's feature amounts. The distinct feature ids are gathered with a
   * server-side DISTINCT query so the big row set is never buffered.
   */
  private async getFeaturesByIdForProjectAmounts(
    projectId: string,
  ): Promise<FeatureByIdMap> {
    const featureIdRows: { featureId: string }[] = await this.geoEntityManager
      .createQueryBuilder(FeatureAmountsPerPlanningUnitEntity, 'fappu')
      .select('fappu.featureId', 'featureId')
      .distinct(true)
      .where('fappu.projectId = :projectId', { projectId })
      .getRawMany<{ featureId: string }>();

    return this.getFeaturesById(
      featureIdRows.map(({ featureId }) => featureId),
    );
  }

  private async getFeaturesById(featureIds: string[]) {
    const result: FeatureByIdMap = {};

    if (!featureIds.length) return result;

    const features: FeaturesSelectResult[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('feature_class_name', 'featureName')
      .addSelect('id')
      .addSelect('is_custom', 'isCustom')
      .from('features', 'f')
      .where('id IN (:...featureIds)', { featureIds })
      .execute();

    return features.reduce((prev, { id, ...rest }) => {
      prev[id] = rest;
      return prev;
    }, result);
  }

  private async getProjectPusById(projectId: string) {
    const projectPus = await this.projectPusRepo.find({
      where: { projectId },
    });
    const projectPusById: Record<string, number> = {};

    projectPus.reduce((prev, { id, puid }) => {
      prev[id] = puid;
      return prev;
    }, projectPusById);

    return projectPusById;
  }

  private async getProjectFeaturesGeoOperations(projectId: string) {
    const derivedFeatures: ProjectFeaturesSelectResult[] =
      await this.apiEntityManager
        .createQueryBuilder()
        .select('feature_class_name', 'featureName')
        .addSelect('from_geoprocessing_ops', 'geoOperation')
        .from('features', 'f')
        .where('project_id = :projectId', { projectId })
        .andWhere('from_geoprocessing_ops IS NOT NULL')
        .execute();

    const dataFeatureIds = derivedFeatures.map(({ geoOperation }) => {
      if (geoOperation.operation !== SpecificationOperation.Split) {
        const errorMessage = 'Can only proccess split features';
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      return geoOperation.baseFeatureId;
    });

    const dataFeaturesById = await this.getFeaturesById(dataFeatureIds);

    return derivedFeatures.map(({ featureName, geoOperation }) => ({
      featureName,
      geoOperation: {
        operation: geoOperation.operation,
        splitByProperty: geoOperation.splitByProperty,
        value: geoOperation.value,
        baseFeatureName:
          dataFeaturesById[geoOperation.baseFeatureId].featureName,
        baseFeatureIsCustom:
          dataFeaturesById[geoOperation.baseFeatureId].isCustom,
      },
    }));
  }
}
