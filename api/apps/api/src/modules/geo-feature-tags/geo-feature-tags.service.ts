import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { GeoFeatureTag } from '@marxan-api/modules/geo-feature-tags/geo-feature-tag.api.entity';
import { DataSource, ILike, Repository } from 'typeorm';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { Either, left, right } from 'fp-ts/lib/Either';
import { ProjectAclService } from '@marxan-api/modules/access-control/projects-acl/project-acl.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import {
  projectNotEditable,
  projectNotFound,
  projectNotVisible,
} from '@marxan-api/modules/projects/projects.service';
import { UpdateProjectTagDTO } from '@marxan-api/modules/projects/dto/update-project-tag.dto';

export const featureNotFoundWithinProject = Symbol(
  'feature not found within project',
);
export const featureNotEditableByUserWithinProject = Symbol(
  'feature not editable by user within project',
);
export const tagNotFoundForProject = Symbol('tag not found for Project');

export class GeoFeatureTagsService {
  constructor(
    @InjectRepository(GeoFeatureTag)
    private readonly geoFeatureTagsRepo: Repository<GeoFeatureTag>,
    @InjectRepository(GeoFeature)
    private readonly geoFeaturesRepo: Repository<GeoFeature>,
    @InjectRepository(Project)
    private readonly projectsRepo: Repository<Project>,
    @InjectDataSource(DbConnections.default)
    private readonly apiDataSource: DataSource,
    private readonly projectAclService: ProjectAclService,
  ) {}

  async getGeoFeatureTagsForProject(
    userId: string,
    projectId: string,
    tagFilter?: string[],
    sort?: string[],
  ): Promise<
    Either<typeof projectNotVisible | typeof projectNotFound, string[]>
  > {
    const project = await this.projectsRepo.findOne({
      where: { id: projectId },
    });
    if (!project) {
      return left(projectNotFound);
    }

    if (!(await this.projectAclService.canViewProject(userId, projectId))) {
      return left(projectNotVisible);
    }

    const query = this.geoFeatureTagsRepo
      .createQueryBuilder('feature_tag')
      .select('feature_tag.tag', 'tag')
      .distinct(true)
      .where({ projectId });

    /** @debt
     * Even tho this is a highly focused endpoint returning only a list of, it should conform to JSON:API standards as well
     * FechSpecification constucted is reused for this purposed, but only a single property matter for this query, tag
     * anything else will be ignored
     */
    if (sort) {
      const tagSorting = sort.find(
        (element) => element === 'tag' || element === '-tag',
      );
      if (tagSorting) {
        const order = tagSorting.startsWith('-') ? 'DESC' : 'ASC';
        query.orderBy('feature_tag.tag', order);
      }
    }

    if (tagFilter) {
      query.andWhere(
        `feature_tag.tag ILIKE ANY (array[:...partialTagFilters])`,
        {
          partialTagFilters: tagFilter.map((tagFilter) => `%${tagFilter}%`),
        },
      );
    }

    const result = await query.getRawMany();

    return right(result.map((geoFeatureTag) => geoFeatureTag.tag));
  }

  async updateTagForProject(
    userId: string,
    projectId: string,
    dto: UpdateProjectTagDTO,
  ): Promise<
    Either<
      | typeof projectNotEditable
      | typeof projectNotFound
      | typeof tagNotFoundForProject,
      true
    >
  > {
    const project = await this.projectsRepo.findOne({
      where: { id: projectId },
    });
    if (!project) {
      return left(projectNotFound);
    }

    const existingTag = await this.geoFeatureTagsRepo.findOne({
      where: { tag: dto.tagName },
    });
    if (!existingTag) {
      return left(tagNotFoundForProject);
    }

    if (!(await this.projectAclService.canEditProject(userId, projectId))) {
      return left(projectNotEditable);
    }

    await this.geoFeatureTagsRepo.update(
      { projectId, tag: dto.tagName },
      { tag: dto.updatedTagName },
    );

    return right(true);
  }

  async setOrUpdateTagForFeature(
    userId: string,
    projectId: string,
    featureId: string,
    tag: string,
  ): Promise<
    Either<
      | typeof featureNotFoundWithinProject
      | typeof featureNotEditableByUserWithinProject,
      true
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
      true
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

  async deleteTagForProject(
    userId: string,
    projectId: string,
    tag: string,
  ): Promise<Either<typeof projectNotEditable | typeof projectNotFound, true>> {
    const project = await this.projectsRepo.findOne({
      where: { id: projectId },
    });

    if (!project) {
      return left(projectNotFound);
    }

    // RBAC checks
    if (!(await this.projectAclService.canEditProject(userId, projectId))) {
      return left(projectNotEditable);
    }

    await this.geoFeatureTagsRepo.delete({
      projectId,
      tag: ILike(tag),
    });

    return right(true);
  }

  async extendFindAllGeoFeaturesWithTags(
    geoFeatures: GeoFeature[],
  ): Promise<GeoFeature[]> {
    const featureIds = geoFeatures.map((i) => i.id);

    const featureTags: {
      id: string;
      tag: string;
    }[] = await this.geoFeatureTagsRepo
      .createQueryBuilder()
      .select('feature_id', 'id')
      .addSelect('tag', 'tag')
      .where('feature_id IN (:...featureIds)', { featureIds })
      .execute();

    return geoFeatures.map((feature) => {
      const featureTag = featureTags.find(
        (element) => element.id === feature.id,
      );

      return {
        ...feature,
        tag: featureTag ? featureTag.tag : undefined,
      } as GeoFeature;
    });
  }

  async extendFindGeoFeatureWithTag(
    geoFeature: GeoFeature,
  ): Promise<GeoFeature> {
    const featureTag: {
      feature_id: string;
      tag: string;
    }[] = await this.geoFeatureTagsRepo
      .createQueryBuilder()
      .select('feature_id', 'tag')
      .where('feature_id = :featureId)', { featureId: geoFeature.id })
      .execute();

    return {
      ...geoFeature,
      tag: featureTag.length ? featureTag[0].tag : undefined,
    } as GeoFeature;
  }
}
