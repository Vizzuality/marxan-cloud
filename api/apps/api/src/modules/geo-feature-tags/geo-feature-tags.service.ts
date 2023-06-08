import { InjectRepository } from '@nestjs/typeorm';
import { GeoFeatureTag } from '@marxan-api/modules/geo-feature-tags/geo-feature-tag.api.entity';
import { Repository } from 'typeorm';

export class GeoFeatureTagsService {
  constructor(
    @InjectRepository(GeoFeatureTag)
    private readonly geoFeatureTagsRepo: Repository<GeoFeatureTag>,
  ) {}

  async updateTagForFeature(
    projectId: string,
    featureId: string,
    tag: string,
  ): Promise<void> {
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
  }
}
