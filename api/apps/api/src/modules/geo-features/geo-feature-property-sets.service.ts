import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { flatten } from 'lodash';
import { In, IsNull, Not, Repository } from 'typeorm';
import { inspect } from 'util';
import { Project } from '../projects/project.api.entity';
import { Scenario } from '../scenarios/scenario.api.entity';
import { GeoFeatureSetSpecification } from './dto/geo-feature-set-specification.dto';
import { GeoFeature } from './geo-feature.api.entity';
import { GeoFeaturePropertySet } from './geo-feature.geo.entity';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { BBox } from 'geojson';
import { antimeridianBbox, nominatim2bbox } from '@marxan/utils/geo';

@Injectable()
export class GeoFeaturePropertySetService {
  constructor(
    @InjectRepository(GeoFeaturePropertySet, DbConnections.geoprocessingDB)
    private readonly geoFeaturePropertySetsRepository: Repository<GeoFeaturePropertySet>,
    @InjectRepository(GeoFeature)
    private readonly geoFeaturesRepository: Repository<GeoFeature>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  getFeaturePropertySetsForFeatures(
    geoFeatureIds: string[],
    withinBBox?: BBox | null,
  ): Promise<GeoFeaturePropertySet[]> {
    const query = this.geoFeaturePropertySetsRepository
      .createQueryBuilder('propertySets')
      .distinct(true)
      .where(`propertySets.featureId IN (:...ids)`, { ids: geoFeatureIds });

    if (withinBBox) {
      const { westBbox, eastBbox } = antimeridianBbox(
        nominatim2bbox(withinBBox),
      );
      query.andWhere(
        `(st_intersects(
            st_intersection(st_makeenvelope(:...eastBbox, 4326),
                                  ST_MakeEnvelope(0, -90, 180, 90, 4326)),
          "propertySets".bbox)
          or
          st_intersects(
            st_intersection(st_makeenvelope(:...westBbox, 4326),
                                  ST_MakeEnvelope(-180, -90, 0, 90, 4326)),
            "propertySets".bbox))`,
        {
          westBbox: westBbox,
          eastBbox: eastBbox,
        },
      );
    }
    return query.getMany();
  }

  extendGeoFeaturesWithPropertiesFromPropertySets(
    geoFeatures: GeoFeature[],
    propertySet: GeoFeaturePropertySet[],
  ) {
    return geoFeatures.map((i) => {
      const propertySetForFeature = propertySet.filter(
        (ps) => ps.featureId === i.id,
      );
      const properties: Record<string, (string | number)[]> = {};
      for (const set of propertySetForFeature) {
        properties[set.key] ??= [];
        properties[set.key].push(set.value[0]);
      }
      return {
        ...i,
        properties,
      };
    });
  }

  /**
   * Add feature metadata to features in a geofeatures processing specification.
   */
  async extendGeoFeatureProcessingSpecification(
    specification: GeoFeatureSetSpecification,
    scenario: Pick<Scenario, 'projectId'>,
  ): Promise<any> {
    const project = await this.projectRepository.findOne({
      where: { id: scenario.projectId },
    });
    // Users can submit or request an empty specification; in this case we
    // simply return it verbatim, as we won't have any features to extend with
    // metadata.
    if (specification.features.length === 0) {
      return specification;
    }
    const idsOfFeaturesInGeoprocessingOperations = new Set(
      flatten(
        specification.features
          .map(
            (feature) =>
              feature.geoprocessingOperations
                ?.map((op) => {
                  if (op.kind === 'stratification/v1') {
                    return op.intersectWith.featureId;
                  }
                })
                .filter((id): id is string => !!id),
          )
          .filter((id): id is string[] => !!id),
      ),
    );
    const idsOfTopLevelFeaturesInSpecification = new Set(
      specification.features.map((feature) => feature.featureId),
    );
    const idsOfFeaturesInSpecification = Array.from(
      new Set([
        ...idsOfTopLevelFeaturesInSpecification,
        ...idsOfFeaturesInGeoprocessingOperations,
      ]),
    );
    const featuresInSpecification = await this.geoFeaturesRepository.find({
      where: { id: In(idsOfFeaturesInSpecification) },
    });
    Logger.debug(inspect(featuresInSpecification));
    const metadataForFeaturesInSpecification =
      await this.getFeaturePropertySetsForFeatures(
        idsOfFeaturesInSpecification,
        project?.bbox,
      );
    const featuresInSpecificationWithPropertiesMetadata =
      this.extendGeoFeaturesWithPropertiesFromPropertySets(
        featuresInSpecification,
        metadataForFeaturesInSpecification,
      );
    // Materialized split children are real features; surface each child's real
    // id (plus its amounts / creation status) per split value so the frontend
    // can read them back instead of relying on virtual `${parentId}-${value}`
    // ids. Each split value is matched against the canonical config stored on
    // the derived feature (`fromGeoprocessingOps`).
    const hasSplitOperations = specification.features.some((feature) =>
      feature.geoprocessingOperations?.some((op) => op.kind === 'split/v1'),
    );
    const derivedChildFeatures = hasSplitOperations
      ? await this.geoFeaturesRepository.find({
          where: {
            projectId: scenario.projectId,
            geoprocessingOpsHash: Not(IsNull()),
          },
        })
      : [];
    return {
      status: specification.status,
      features: specification.features.map((feature) => {
        const metadata = featuresInSpecificationWithPropertiesMetadata.find(
          (f) => f.id === feature.featureId,
        );
        const geoprocessingOperations = feature.geoprocessingOperations?.map(
          (op) => {
            if (op.kind !== 'split/v1') {
              return op;
            }
            return {
              ...op,
              splits: op.splits.map((split) => {
                const child = derivedChildFeatures.find(
                  (candidate) =>
                    candidate.fromGeoprocessingOps?.baseFeatureId ===
                      feature.featureId &&
                    candidate.fromGeoprocessingOps?.splitByProperty ===
                      op.splitByProperty &&
                    candidate.fromGeoprocessingOps?.value === split.value,
                );
                if (!child) {
                  return split;
                }
                return {
                  ...split,
                  featureId: child.id,
                  creationStatus: child.creationStatus,
                  ...(child.amountMin != null &&
                    child.amountMax != null && {
                      amountRange: {
                        min: child.amountMin,
                        max: child.amountMax,
                      },
                    }),
                };
              }),
            };
          },
        );
        return {
          ...feature,
          ...(geoprocessingOperations && { geoprocessingOperations }),
          metadata,
        };
      }),
    };
  }
}
