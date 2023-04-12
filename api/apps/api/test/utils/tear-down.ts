import { DataSource } from 'typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { getDataSourceToken } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';

export const tearDown = async (app: INestApplication | undefined) => {
  if (!app) {
    return;
  }

  const dataSources = Object.values(DbConnections)
    .map((name) => getDataSourceToken(name))
    .map((token) => app.get<DataSource>(token));

  await Promise.all(dataSources.map((datasource) => datasource.destroy()));
};
