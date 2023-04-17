import { DataSource } from 'typeorm';
import { apiConnections } from '@marxan-api/ormconfig';

export const apiDataSource: DataSource = new DataSource(apiConnections.default);
