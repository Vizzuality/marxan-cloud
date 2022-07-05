import { ProjectRoles } from '@marxan-api/modules/access-control/projects-acl/dto/user-role-project.dto';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ExportId } from '@marxan-api/modules/clone';
import { ExportRepository } from '@marxan-api/modules/clone/export/application/export-repository.port';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { groupBy } from 'lodash';
import { Repository } from 'typeorm';

export const removeExportIdsForUnfinishedExports = async (
  publishedProjects: PublishedProject[],
  exportRepo: ExportRepository,
): Promise<PublishedProject[]> => {
  const processedPublishedProjects = await Promise.all(
    publishedProjects.map(async (entity) => {
      const exportIdString = entity?.exportId;

      if (exportIdString) {
        const exportId = new ExportId(exportIdString);
        const finalExport = await exportRepo.find(exportId);
        if (!finalExport?.hasFinished()) {
          delete entity.exportId;
        }
      }
      return entity;
    }),
  );

  return processedPublishedProjects;
};

export const addOwnerEmails = async (
  publishedProjects: PublishedProject[],
  usersProjectsRepo: Repository<UsersProjectsApiEntity>,
): Promise<PublishedProject[]> => {
  const allOwnersOfAllProjectsPlusEmail = await usersProjectsRepo.query(
    `
        select up.project_id, up.user_id, u.email
          from users_projects as up
             left join users as u
                  on (u."id" = up.user_id)
          where up.project_id IN (SELECT id FROM published_projects) AND up.role_id = $1;`,
    [ProjectRoles.project_owner],
  );
  const ownersPerProject = groupBy(
    allOwnersOfAllProjectsPlusEmail,
    (item) => item.project_id,
  );

  const processedPublicProjects = publishedProjects.map((entity) => ({
    ...entity,
    ownerEmails: ownersPerProject[entity.id].map((item) => ({
      id: item.user_id,
      email: item.email,
    })),
  }));

  return processedPublicProjects;
};
