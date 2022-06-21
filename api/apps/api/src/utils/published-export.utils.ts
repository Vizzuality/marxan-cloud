import { ExportId } from '@marxan-api/modules/clone';
import { ExportRepository } from '@marxan-api/modules/clone/export/application/export-repository.port';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';

export const exportHasFinished = async (
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
