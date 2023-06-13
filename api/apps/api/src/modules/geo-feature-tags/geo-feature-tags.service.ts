import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { GeoFeatureTag } from '@marxan-api/modules/geo-feature-tags/geo-feature-tag.api.entity';
import { DataSource, Repository } from 'typeorm';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { Either, left, right } from 'fp-ts/lib/Either';
import { ProjectAclService } from '@marxan-api/modules/access-control/projects-acl/project-acl.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';

export const featureNotFound = Symbol('feature not found');
export const featureNotFoundWithinProject = Symbol(
  'feature not found within project',
);
export const featureNotEditableByUserWithinProject = Symbol(
  'feature not editable by user within project',
);

export class GeoFeatureTagsService {
  constructor(
    @InjectRepository(GeoFeatureTag)
    private readonly geoFeatureTagsRepo: Repository<GeoFeatureTag>,
    @InjectRepository(GeoFeature)
    private readonly geoFeaturesRepo: Repository<GeoFeature>,
    @InjectDataSource(DbConnections.default)
    private readonly apiDataSource: DataSource,
    private readonly projectAclService: ProjectAclService,
  ) {}

  async setOrUpdateTagForFeature(
    userId: string,
    projectId: string,
    featureId: string,
    tag: string,
  ): Promise<
    Either<
      | typeof featureNotFoundWithinProject
      | typeof featureNotEditableByUserWithinProject,
      any
    >
  > {
    const geoFeature = await this.geoFeaturesRepo.findOne({
      where: { id: featureId, projectId },
    });

    if (!geoFeature) {
      return left(featureNotFoundWithinProject);
    }

    // RBAC checks
    if (
      !(await this.projectAclService.canEditFeatureInProject(userId, projectId))
    ) {
      return left(featureNotEditableByUserWithinProject);
    }

    // Updating a tag is will be executed as removal/insert instead of update, so that the processing of equivalent
    // capitalization tags can be done at DB level
    const apiQueryRunner = this.apiDataSource.createQueryRunner();
    await apiQueryRunner.connect();
    await apiQueryRunner.startTransaction();

    try {
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
    } catch (err) {
      await apiQueryRunner.rollbackTransaction();
      throw err;
    } finally {
      await apiQueryRunner.release();
    }
  }

  async deleteTagForFeature(
    userId: string,
    projectId: string,
    featureId: string,
  ): Promise<
    Either<
      | typeof featureNotFoundWithinProject
      | typeof featureNotEditableByUserWithinProject,
      any
    >
  > {
    const geoFeature = await this.geoFeaturesRepo.findOne({
      where: { id: featureId, projectId },
    });

    if (!geoFeature) {
      return left(featureNotFoundWithinProject);
    }

    // RBAC checks
    if (
      !(await this.projectAclService.canEditFeatureInProject(userId, projectId))
    ) {
      return left(featureNotEditableByUserWithinProject);
    }

    await this.geoFeatureTagsRepo.delete({ featureId });

    return right(true);
  }
}
