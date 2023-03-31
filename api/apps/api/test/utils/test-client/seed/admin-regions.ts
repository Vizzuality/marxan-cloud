import { Connection } from 'typeorm';

export const insertAdminRegions = async (connection: Connection) => {
  await connection.manager.query(
    '\n' +
      'INSERT INTO admin_regions \n' +
      '(the_geom, name_0, name_1, name_2, iso3, gid_0, gid_1, gid_2, level, created_by)\n' +
      'VALUES\n' +
  );
};