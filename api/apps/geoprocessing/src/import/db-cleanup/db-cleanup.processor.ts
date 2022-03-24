import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ResourceKind } from '@marxan/cloning/domain';
import { FailedImportDbCleanupJobInput } from '@marxan/cloning/job-input';
import { FailedImportDbCleanupJobOutput } from '@marxan/cloning/job-output';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { geoprocessingConnections } from '../../ormconfig';

@Injectable()
export class DbCleanupProcessor {
  #dbCleaners: Record<ResourceKind, (resourceId: string) => Promise<void>> = {
    [ResourceKind.Project]: (projectId) => this.cleanProjectImport(projectId),
    [ResourceKind.Scenario]: (scenarioId) =>
      this.cleanScenarioImport(scenarioId),
  };

  constructor(
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
  ) {}

  private async cleanScenarioImport(scenarioId: string) {
    const apiQb = this.apiEntityManager.createQueryBuilder();
    const geoQb = this.geoprocessingEntityManager.createQueryBuilder();

    await apiQb
      .delete()
      .from('scenarios')
      .where('id = :scenarioId', { scenarioId })
      .execute();

    await geoQb
      .delete()
      .from('blm_final_results')
      .where('scenario_id = :scenarioId', { scenarioId })
      .execute();

    const scenariosPuDataQb = this.geoprocessingEntityManager
      .createQueryBuilder()
      .select('id')
      .from('scenarios_pu_data', 'spd')
      .where('scenario_id = :scenarioId', { scenarioId });
    await geoQb
      .delete()
      .from('output_scenarios_pu_data', 'ospd')
      .where(`scenario_pu_id IN (${scenariosPuDataQb.getQuery()})`)
      .setParameters(scenariosPuDataQb.getParameters())
      .execute();

    await geoQb
      .delete()
      .from('scenarios_pu_data')
      .where('scenario_id = :scenarioId', { scenarioId })
      .execute();
  }

  private async cleanProjectImport(projectId: string) {
    const apiQb = this.apiEntityManager.createQueryBuilder();
    const geoQb = this.geoprocessingEntityManager.createQueryBuilder();

    const scenarios: Scenario[] = await apiQb
      .select('id')
      .from('scenarios', 's')
      .where('project_id = :projectId', {
        projectId,
      })
      .execute();
    const scenarioIds = scenarios.map((scenario) => scenario.id);
    const projectHasScenarios = scenarioIds.length > 0;

    await apiQb
      .delete()
      .from('projects')
      .where('id = :projectId', { projectId })
      .execute();
    await geoQb
      .delete()
      .from('planning_areas')
      .where('project_id = :projectId', { projectId })
      .execute();
    await geoQb
      .delete()
      .from('wdpa')
      .where('project_id = :projectId', { projectId })
      .execute();

    if (projectHasScenarios) {
      await geoQb
        .delete()
        .from('blm_final_results')
        .where('scenario_id IN (:...scenarioIds)', { scenarioIds })
        .execute();

      const scenariosPuDataQb = this.geoprocessingEntityManager
        .createQueryBuilder()
        .select('id')
        .from('scenarios_pu_data', 'spd')
        .where('scenario_id IN (:...scenarioIds)', { scenarioIds });

      await geoQb
        .delete()
        .from('output_scenarios_pu_data', 'ospd')
        .where(`scenario_pu_id IN (${scenariosPuDataQb.getQuery()})`)
        .setParameters(scenariosPuDataQb.getParameters())
        .execute();
    }

    await geoQb
      .delete()
      .from('projects_pu')
      .where('project_id = :projectId', { projectId })
      .execute();
  }

  async run(
    input: FailedImportDbCleanupJobInput,
  ): Promise<FailedImportDbCleanupJobOutput> {
    await this.#dbCleaners[input.resourceKind](input.resourceId);
    return input;
  }
}
