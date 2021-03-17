import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { geoprocessingConnections } from 'src/ormconfig';
import { createConnection } from 'typeorm';

const logger = new Logger('planning-units-job-processor');

export interface PlanningUnitsJob {
  countryId?: string;
  adminRegionId?: string;
  adminAreaLevel1Id?: string;
  adminAreaLevel2Id?: string;
  planningUnitGridShape: string;
  planningUnitAreakm2: number;
  extent?: Record<string, unknown>;
}

export default async (job: Job<PlanningUnitsJob>) => {
  logger.debug(`Start planning-units processing for ${job.id}...`);
  if (job.name === 'transcode') {
    const connection = await createConnection({
      ...geoprocessingConnections.default,
    });
    try {
      let subquery: string;
      const gridShape = {
        square: 'ST_SquareGrid',
        hexagon: 'ST_HexagonGrid',
      };
      if (job.data.extent) {
        subquery = `(SELECT (${gridShape[job.data.planningUnitGridShape]}(${
          Math.sqrt(job.data.planningUnitAreakm2) * 1000
        },
                            ST_Transform(ST_GeomFromGeoJSON('${
                              job.data.extent
                            }'), 3857))).* ) grid`;
      } else {
        const filterSQL: string[] = [];
        if (job.data.countryId?.length) {
          filterSQL.push(`gid_0 = '${job.data.countryId}'`);
        }
        if (job.data.adminAreaLevel1Id?.length) {
          filterSQL.push(`gid_1 = '${job.data.adminAreaLevel1Id}'`);
        }
        if (job.data.adminAreaLevel2Id?.length) {
          filterSQL.push(`gid_2 = '${job.data.adminAreaLevel2Id}'`);
        }
        subquery = `(SELECT (${gridShape[job.data.planningUnitGridShape]}(${
          Math.sqrt(job.data.planningUnitAreakm2) * 1000
        },
                            ST_Transform(a.the_geom, 3857))).*
                    FROM admin_regions a
                    WHERE ${filterSQL.join(' AND ')} ) grid`;
      }
      logger.debug(job.data);

      const queryResult = await connection.query(`INSERT INTO planning_units_geom (the_geom, type, size)
                        select st_transform(geom, 4326) as the_geom,
                        '${job.data.planningUnitGridShape}' as type,
                        ${job.data.planningUnitAreakm2} as size from ${subquery}
                        ON CONFLICT ON CONSTRAINT planning_units_geom_the_geom_type_key DO NOTHING;`);
      // now we can execute any queries on a query runner, for example:
      logger.debug(queryResult);
      // await job.updateProgress(42);
      logger.debug('Planning unit creation completed');
    } catch (err) {
      logger.error(err);
      throw err;
    } finally {
      await connection.close();
    }
  }
};
