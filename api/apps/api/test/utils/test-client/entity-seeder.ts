import { DataSource } from 'typeorm';
import { apiConnections } from '@marxan-api/ormconfig';

/**
 * @description Utility function to create entities in the DB avoiding hitting the test API endpoints
 */

export class EntitySeeder {
  private dataSource: DataSource;
  private isConnected = false;

  constructor() {
    this.dataSource = new DataSource({
      ...apiConnections.default,
      name: 'apiTestsConnection',
    });
  }

  async openConnection() {
    await this.dataSource.initialize();
    this.isConnected = true;
  }

  async closeConnection() {
    await this.dataSource.destroy();
    this.isConnected = false;
  }

  async seed<T>(
    Entity: { new (): T },
    entityData: Partial<T> = {},
  ): Promise<T> {
    if (!this.isConnected) {
      await this.openConnection();
    }
    const entity = Object.assign(new Entity(), entityData);
    return this.dataSource.getRepository(Entity).save(entity);
  }
}
