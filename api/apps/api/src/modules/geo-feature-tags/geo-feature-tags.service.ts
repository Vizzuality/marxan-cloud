import { InjectRepository } from '@nestjs/typeorm';
import { GeoFeatureTag } from '@marxan-api/modules/geo-feature-tags/geo-feature-tag.api.entity';
import { Repository } from 'typeorm';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { Either, left, right } from 'fp-ts/lib/Either';

export const featureNotFound = Symbol('feature not found');
export const featureProjectNotRelated = Symbol(
  'feature and project not related',
);

export class GeoFeatureTagsService {
  constructor(
    @InjectRepository(GeoFeatureTag)
    private readonly geoFeatureTagsRepo: Repository<GeoFeatureTag>,
    @InjectRepository(GeoFeature)
    private readonly geoFeaturesRepo: Repository<GeoFeature>,
  ) {}

  async updateTagForFeature(
    projectId: string,
    featureId: string,
    tag: string,
  ): Promise<
    Either<typeof featureNotFound | typeof featureProjectNotRelated, any>
  > {
    const geoFeature = await this.geoFeaturesRepo.findOne({
      where: { id: featureId },
    });

    if (!geoFeature) {
      return left(featureNotFound);
    }
    if (geoFeature.projectId !== projectId) {
      return left(featureProjectNotRelated);
    }

    // Updating a tag is will be executed as removal/insert instead of update, so that the processing of equivalent
    // capitalization tags can be done at DB level
    const previousTag = await this.geoFeatureTagsRepo.findOne({
      where: { projectId, featureId },
    });
    if (previousTag) {
      await this.geoFeatureTagsRepo.delete(previousTag.id);
    }

    await this.geoFeatureTagsRepo.save(
      this.geoFeatureTagsRepo.create({ projectId, featureId, tag }),
    );

    return right(true);
  }
}
