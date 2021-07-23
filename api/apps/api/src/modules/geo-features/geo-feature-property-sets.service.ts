import { apiConnections } from '@marxan-api/ormconfig';
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

@Injectable()
export class GeoFeaturePropertySetService {
  constructor(
    @InjectRepository(
      GeoFeaturePropertySet,
      apiConnections.geoprocessingDB.name,
    )
    private readonly geoFeaturePropertySetsRepository: Repository<GeoFeaturePropertySet>,
    @InjectRepository(GeoFeature)
    private readonly geoFeaturesRepository: Repository<GeoFeature>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  getFeaturePropertySetsForFeatures(
    geoFeatureIds: string[],
    forProject?: Project | null | undefined,
  ): Promise<GeoFeaturePropertySet[]> {
    const query = this.geoFeaturePropertySetsRepository
      .createQueryBuilder('propertySets')
      .distinct(true)
      .where(`propertySets.featureId IN (:...ids)`, { ids: geoFeatureIds });

    if (forProject) {
      query.andWhere(
        `st_intersects(
        st_makeenvelope(:xmin, :ymin, :xmax, :ymax, 4326),
        "propertySets".bbox
      )`,
        {
          xmin: forProject.bbox[1],
          ymin: forProject.bbox[3],
          xmax: forProject.bbox[0],
          ymax: forProject.bbox[2],
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
      return {
        ...i,
        properties: propertySetForFeature.reduce((acc, cur) => {
          return {
            ...acc,
            [cur.key]: [...(acc[cur.key] || []), cur.value[0]],
          };
        }, {} as Record<string, Array<string | number>>),
      };
    });
  }

  /**
   * Add feature metadata to features in a geofeatures processing specification.
   */
  async extendGeoFeatureProcessingSpecification(
    specification: GeoFeatureSetSpecification,
    scenario: Scenario,
  ): Promise<any> {
    const project = await this.projectRepository.findOne(scenario.projectId);
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
      project,
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
