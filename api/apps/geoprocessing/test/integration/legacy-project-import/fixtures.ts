import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

export async function GivenProjectAndScenarioShells(
  em: EntityManager,
  organizationId: string,
  projectId: string,
  scenarioId: string,
): Promise<void> {
  await em
    .createQueryBuilder()
    .insert()
    .into('organizations')
    .values({
      id: organizationId,
      name: `test organization - ${organizationId}`,
    })
    .execute();

  const projectName = `test project - ${projectId}`;
  await em
    .createQueryBuilder()
    .insert()
    .into('projects')
    .values({
      id: projectId,
      name: projectName,
      organization_id: organizationId,
    })
    .execute();

  const costSurfaceId = v4();
  await em
    .createQueryBuilder()
    .insert()
    .into(`cost_surfaces`)
    .values({
      id: costSurfaceId,
      name: `${projectName} - Default Cost Surface`,
      project_id: projectId,
      min: 0,
      max: 0,
      is_default: true,
    })
    .execute();

  await em
    .createQueryBuilder()
    .insert()
    .into('scenarios')
    .values({
      id: scenarioId,
      name: `test scenario - ${scenarioId}`,
      project_id: projectId,
      cost_surface_id: costSurfaceId,
    })
    .execute();
}

export async function DeleteProjectAndScenarioShells(
  em: EntityManager,
  organizationId: string,
  projectId: string,
): Promise<void> {
  await em
    .createQueryBuilder()
    .delete()
    .from('projects')
    .where({
      id: projectId,
    })
    .execute();

  await em
    .createQueryBuilder()
    .delete()
    .from('organizations')
    .where({
      id: organizationId,
    })
    .execute();
}
