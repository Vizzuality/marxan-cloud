import { Injectable } from '@nestjs/common';
import {
  SpecForGeoFeatureWithGeoprocessing,
  SpecForPlainGeoFeature,
} from '../../geo-features/dto/geo-feature-set-specification.dto';
import {
  FeatureSubSet,
  SpecificationFeatureCopy,
  SpecificationFeatureSplit,
  SpecificationFeatureStratification,
} from '@marxan-api/modules/specification/application/specification-input';
import { plainToClass } from 'class-transformer';
import { SpecificationOperation } from '@marxan-api/modules/specification/domain';
import {
  GeoprocessingOpSplitV1,
  GeoprocessingOpStratificationV1,
} from '@marxan-api/modules/geo-features/types/geo-feature.geoprocessing-operations.type';

@Injectable()
export class GeoFeatureDtoMapper {
  toFeatureConfig(
    featureSpecification:
      | SpecForPlainGeoFeature
      | SpecForGeoFeatureWithGeoprocessing,
  ): (
    | SpecificationFeatureCopy
    | SpecificationFeatureSplit
    | SpecificationFeatureStratification
  )[] {
    if (this.#iFeatureSpecGeoProcessing(featureSpecification)) {
      return (featureSpecification.geoprocessingOperations ?? []).flatMap(
        (specificationPiece) =>
          this.#isStratification(specificationPiece)
            ? plainToClass<
                SpecificationFeatureStratification,
                SpecificationFeatureStratification
              >(SpecificationFeatureStratification, {
                operation: SpecificationOperation.Stratification,
                baseFeatureId: featureSpecification.featureId,
                againstFeatureId: specificationPiece.intersectWith.featureId,
                splitByProperty: specificationPiece.splitByProperty,
                selectSubSets: (specificationPiece.splits ?? []).map((split) =>
                  plainToClass<FeatureSubSet, FeatureSubSet>(FeatureSubSet, {
                    value: split.value,
                    target: split.marxanSettings.target,
                    fpf: split.marxanSettings.fpf,
                    prop: split.marxanSettings.prop,
                  }),
                ),
              })
            : plainToClass<
                SpecificationFeatureSplit,
                SpecificationFeatureSplit
              >(SpecificationFeatureSplit, {
                operation: SpecificationOperation.Split,
                baseFeatureId: featureSpecification.featureId,
                splitByProperty: specificationPiece.splitByProperty,
                selectSubSets: (specificationPiece.splits ?? []).map((split) =>
                  plainToClass<FeatureSubSet, FeatureSubSet>(FeatureSubSet, {
                    value: split.value,
                    target: split.marxanSettings.target,
                    fpf: split.marxanSettings.fpf,
                    prop: split.marxanSettings.prop,
                  }),
                ),
              }),
      );
    }
    return [
      plainToClass<SpecificationFeatureCopy, SpecificationFeatureCopy>(
        SpecificationFeatureCopy,
        {
          operation: SpecificationOperation.Copy,
          baseFeatureId: featureSpecification.featureId,
          fpf: featureSpecification.marxanSettings.fpf,
          prop: featureSpecification.marxanSettings.prop,
          target: featureSpecification.marxanSettings.target,
          selectSubSets: undefined as never,
        },
      ),
    ];
  }

  #isStratification = (
    featureOperation: GeoprocessingOpStratificationV1 | GeoprocessingOpSplitV1,
  ): featureOperation is GeoprocessingOpStratificationV1 =>
    'intersectWith' in featureOperation;

  #iFeatureSpecGeoProcessing = (
    featureSpecification:
      | SpecForPlainGeoFeature
      | SpecForGeoFeatureWithGeoprocessing,
  ): featureSpecification is SpecForGeoFeatureWithGeoprocessing =>
    'geoprocessingOperations' in featureSpecification;
}
