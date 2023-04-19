import { Connection, getConnection } from 'typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

export const seedWdpa = async () => {
  const connection: Connection = await getConnection(
    geoprocessingConnections.default.name,
  );
  await connection.manager.query(
    '\n' +
      `

INSERT INTO wdpa
(wdpaid, the_geom, full_name, iucn_cat, shape_leng, shape_area, iso3, status, desig, created_by)
VALUES


      `,
  );
};