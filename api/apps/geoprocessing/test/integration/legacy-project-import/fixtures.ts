import { EntityManager } from 'typeorm';

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

  await em
    .createQueryBuilder()
    .insert()
    .into('projects')
    .values({
      id: projectId,
      name: `test project - ${projectId}`,
      organization_id: organizationId,
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
