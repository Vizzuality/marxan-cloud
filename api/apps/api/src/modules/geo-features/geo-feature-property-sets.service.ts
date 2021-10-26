import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { flatten } from 'lodash';
import { In, Repository } from 'typeorm';
import { inspect } from 'util';
import { Project } from '../projects/project.api.entity';
import { Scenario } from '../scenarios/scenario.api.entity';
import { GeoFeatureSetSpecification } from './dto/geo-feature-set-specification.dto';
import { GeoFeature } from './geo-feature.api.entity';
import { GeoFeaturePropertySet } from './geo-feature.geo.entity';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { BBox } from 'geojson';

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
      query.andWhere(
        `st_intersects(
        st_makeenvelope(:xmin, :ymin, :xmax, :ymax, 4326),
        "propertySets".bbox
      )`,
        {
          xmin: withinBBox[1],
          ymin: withinBBox[3],
          xmax: withinBBox[0],
          ymax: withinBBox[2],
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
    const project = await this.projectRepository.findOne(scenario.projectId);
    // Users can submit or request an empty specification; in this case we
    // simply return it verbatim, as we won't have any features to extend with
    // metadata.
    if (specification.features.length === 0) {
      return specification;
    }
    const idsOfFeaturesInGeoprocessingOperations = new Set(
      flatten(
        specification.features
          .map((feature) =>
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
      id: In(idsOfFeaturesInSpecification),
    });
    Logger.debug(inspect(featuresInSpecification));
    const metadataForFeaturesInSpecification = await this.getFeaturePropertySetsForFeatures(
      idsOfFeaturesInSpecification,
      project?.bbox,
    );
    const featuresInSpecificationWithPropertiesMetadata = this.extendGeoFeaturesWithPropertiesFromPropertySets(
      featuresInSpecification,
      metadataForFeaturesInSpecification,
    );
    return {
      status: specification.status,
      features: specification.features.map((feature) => {
        return {
          ...feature,
          metadata: featuresInSpecificationWithPropertiesMetadata.find(
            (f) => f.id === feature.featureId,
          ),
        };
      }),
    };
  }
}
