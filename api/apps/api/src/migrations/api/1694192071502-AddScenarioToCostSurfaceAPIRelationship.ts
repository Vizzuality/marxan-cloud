import { DataSource, MigrationInterface, QueryRunner } from 'typeorm';
import { apiConnections } from '@marxan-api/ormconfig';
import { Logger } from '@nestjs/common';

export class AddScenarioToCostSurfaceAPIRelationship1694192071502
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await costSurfaceMigrationUp(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await costSurfaceMigrationDown(queryRunner);
  }
}

async function costSurfaceMigrationUp(queryRunner: QueryRunner): Promise<void> {
  const geoDatasource: DataSource = new DataSource({
    ...apiConnections.geoprocessingDB,
    name: 'geoMigration',
  });
  await geoDatasource.initialize();

  const apiQueryRunner = queryRunner;
  const geoQueryRunner = geoDatasource.createQueryRunner();

  await apiQueryRunner.startTransaction();
  await geoQueryRunner.startTransaction();
  try {
    await apiQueryRunner.query(
      `ALTER TABLE cost_surfaces ADD COLUMN is_migrated boolean DEFAULT false;
            ALTER TABLE scenarios ADD COLUMN cost_surface_id uuid REFERENCES cost_surfaces(id);`,
    );

    const scenarios: {
      id: string;
      name: string;
      project_id: string;
    }[] = await apiQueryRunner.query(
      `SELECT id, name, project_id from scenarios;`,
    );

    // Create Cost Surface per Scenario and link them
    for (const scenario of scenarios) {
      const costSurface: { id: string }[] = await apiQueryRunner.query(
        `INSERT INTO cost_surfaces (id, name, min, max, is_default, project_id, is_migrated)
               VALUES (gen_random_uuid(), $1, 0, 0, false, $2, true)
               RETURNING id;`,
        [`${scenario.name} Cost Surface`, scenario.project_id],
      );

      await apiQueryRunner.query(
        `UPDATE scenarios SET cost_surface_id = $1 WHERE id = $2`,
        [costSurface[0].id, scenario.id],
      );
    }

    await apiQueryRunner.query(
      `ALTER TABLE scenarios ALTER COLUMN cost_surface_id SET NOT NULL`,
    );

    // Create default Project Cost Surfaces
    const projects: {
      id: string;
    }[] = await apiQueryRunner.query(`SELECT id from projects;`);

    for (const project of projects) {
      await apiQueryRunner.query(
        `INSERT INTO cost_surfaces (id, name, min, max, is_default, project_id, is_migrated)
               VALUES (gen_random_uuid(), $1, 0, 0, true, $2, true);`,
        [`Default Cost Surface`, project.id],
      );
    }

    ///////////////////////// Geo processing Side
    // Fix a small bug that would prevent having more than 1 cost surface with shared PUs
    await geoQueryRunner.query(`ALTER TABLE cost_surface_pu_data DROP CONSTRAINT if exists cost_surface_pu_data_puid_key;
                                      ALTER TABLE cost_surface_pu_data ADD CONSTRAINT unique_cost_surface_puid UNIQUE (cost_surface_id, puid);`);

    const updatedScenarios: {
      id: string;
      cost_surface_id: string;
    }[] = await apiQueryRunner.query(
      `SELECT id, cost_surface_id from scenarios;`,
    );

    const orphanScenarios = [];
    for (const updatedScenario of updatedScenarios) {
      await geoQueryRunner.query(
        `INSERT INTO cost_surface_pu_data (puid, cost, cost_surface_id)
               SELECT spd.project_pu_id, spcd.cost, $1
               FROM scenarios_pu_data spd
               INNER JOIN scenarios_pu_cost_data spcd ON spcd.scenarios_pu_data_id = spd.id
               WHERE spd.scenario_id = $2`,
        [updatedScenario.cost_surface_id, updatedScenario.id],
      );

      const minMax: { min: number; max: number } = (
        await geoQueryRunner.query(
          `SELECT MIN(cspd.cost) as min, MAX(cspd.cost) as max
               FROM cost_surface_pu_data cspd
               WHERE cspd.cost_surface_id = $1;`,
          [updatedScenario.cost_surface_id],
        )
      )[0];

      if (minMax.min && minMax.max) {
        await apiQueryRunner.query(
          `UPDATE cost_surfaces SET min = $1, max= $2 WHERE id = $3`,
          [minMax.min, minMax.max, updatedScenario.cost_surface_id],
        );
      } else {
        await apiQueryRunner.query(`DELETE FROM scenarios WHERE id = $1;`, [
          updatedScenario.id,
        ]);
        await apiQueryRunner.query(`DELETE FROM cost_surfaces WHERE id = $1;`, [
          updatedScenario.cost_surface_id,
        ]);
        orphanScenarios.push(updatedScenario.id);
      }
    }

    const projectDefaultCosts: {
      id: string;
      project_id: string;
    }[] = await apiQueryRunner.query(
      `SELECT cs.id, cs.project_id FROM cost_surfaces cs LEFT JOIN projects p ON p.id = cs.project_id WHERE cs.is_default = true`,
    );

    for (const projectDefault of projectDefaultCosts) {
      await geoQueryRunner.query(
        `INSERT INTO cost_surface_pu_data (puid, cost, cost_surface_id)
               SELECT ppu.id, round(pug.area / 1000000) as area, $1
               FROM projects_pu ppu
               INNER JOIN planning_units_geom pug ON pug.id = ppu.geom_id
               WHERE ppu.project_id = $2`,
        [projectDefault.id, projectDefault.project_id],
      );

      const minMax: { min: string; max: string } = (
        await geoQueryRunner.query(
          `SELECT MIN(cspd.cost) as min, MAX(cspd.cost) as max
               FROM cost_surface_pu_data cspd
               WHERE cspd.cost_surface_id = $1;`,
          [projectDefault.id],
        )
      )[0];

      if (minMax.min && minMax.max) {
        await apiQueryRunner.query(
          `UPDATE cost_surfaces SET min = $1, max= $2 WHERE id = $3`,
          [minMax.min, minMax.max, projectDefault.id],
        );
      }
    }

    Logger.log('Orphaned scenarios' + JSON.stringify(orphanScenarios));

    await apiQueryRunner.commitTransaction();
    await geoQueryRunner.commitTransaction();
  } catch (e) {
    await apiQueryRunner.rollbackTransaction();
    await geoQueryRunner.rollbackTransaction();
    throw e;
  } finally {
    await geoDatasource.destroy();
  }
}

async function costSurfaceMigrationDown(
  queryRunner: QueryRunner,
): Promise<void> {
  const geoDatasource: DataSource = new DataSource({
    ...apiConnections.geoprocessingDB,
    name: 'geoMigration',
  });
  await geoDatasource.initialize();

  const apiQueryRunner = queryRunner;
  const geoQueryRunner = geoDatasource.createQueryRunner();

  try {
    const migratedCostSurfaces: {
      id: string;
    }[] = await apiQueryRunner.query(
      `SELECT id from cost_surfaces where is_migrated = true;`,
    );

    await geoDatasource
      .createQueryBuilder()
      .delete()
      .from('cost_surface_pu_data')
      .where('cost_surface_id IN (:...migratedCostSurfaces', {
        migratedCostSurfaces,
      });

    await apiQueryRunner.query(`
        DELETE FROM cost_surfaces WHERE is_migrated = true;
      `);

    await apiQueryRunner.commitTransaction();
    await geoQueryRunner.commitTransaction();
  } catch (e) {
    await apiQueryRunner.rollbackTransaction();
    await geoQueryRunner.rollbackTransaction();
    throw e;
  } finally {
    await geoDatasource.destroy();
  }
}
