/**
 * @todo: temporal tests to check new cost surface entities DB constraints
 *        this will be refactored to be proper e2e tests
 */

import { EntitySeeder } from '../utils/test-client/entity-seeder';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';
import { isUUID, isDate } from 'class-validator';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { Organization } from '@marxan-api/modules/organizations/organization.api.entity';

describe('Temporal: Cost Surface DB constraints', () => {
  let entitySeeder: EntitySeeder;

  beforeAll(async () => {
    entitySeeder = new EntitySeeder();
    await entitySeeder.openConnection();
  });
  afterAll(async () => {
    await entitySeeder.closeConnection();
  });

  test('I can save a cost surface', async () => {
    const name = 'test cost surface';
    const costSurface = await entitySeeder.seed(CostSurface, {
      name,
      min: 1,
      max: 2,
    });

    expect(costSurface).toBeDefined();
    expect(isUUID(costSurface.id)).toBe(true);
    expect(costSurface.name).toEqual(name);
    expect(isDate(costSurface.createdAt)).toBe(true);
    expect(isDate(costSurface.lastModifiedAt)).toBe(true);
    expect(costSurface.isDefault).toBe(false);
  });

  test('I can save a cost surface with a project', async () => {
    const organization = await entitySeeder.seed(Organization, {
      name: 'test organization',
    });
    const user = await entitySeeder.seed(User, {
      email: 'test user',
      isActive: true,
      isAdmin: true,
      passwordHash: 'XXXXXXX',
    });
    const project = await entitySeeder.seed(Project, {
      name: 'test project',
      createdBy: user.id,
      organization,
    });
    const costSurface = await entitySeeder.seed(CostSurface, {
      name: 'test cost surface',
      project,
      min: 1,
      max: 2,
    });

    expect(costSurface).toBeDefined();
    expect(costSurface.projectId).toEqual(project.id);
  });

  test('If I do not set a name for a cost surface it should fail', async () => {
    expect.assertions(1);
    try {
      await entitySeeder.seed(CostSurface, {});
    } catch (e) {
      expect(e.message).toEqual(
        'null value in column "name" of relation "cost_surfaces" violates not-null constraint',
      );
    }
  });
  test('A cost surface name should be unique for a project', async () => {
    const organization = await entitySeeder.seed(Organization, {
      name: 'test organization',
    });
    const user = await entitySeeder.seed(User, {
      email: 'test user',
      isActive: true,
      isAdmin: true,
      passwordHash: 'XXXXXXX',
    });
    const project = await entitySeeder.seed(Project, {
      name: 'test project',
      createdBy: user.id,
      organization,
    });
    await entitySeeder.seed(CostSurface, {
      name: 'test cost surface',
      project,
      min: 1,
      max: 2,
    });

    expect.assertions(1);
    try {
      await entitySeeder.seed(CostSurface, {
        name: 'test cost surface',
        project,
      });
    } catch (e) {
      expect(e.message).toEqual(
        'duplicate key value violates unique constraint "uq_cost_surface_name_for_project"',
      );
    }
  });
  test('Only one cost surface can be default for a project', async () => {
    // create the test
    const organization = await entitySeeder.seed(Organization, {
      name: 'test organization',
    });
    const project = await entitySeeder.seed(Project, {
      name: 'test project',
      organization,
    });
    await entitySeeder.seed(CostSurface, {
      name: 'test cost surface',
      project,
      isDefault: true,
      min: 1,
      max: 2,
    });
    expect.assertions(1);
    try {
      await entitySeeder.seed(CostSurface, {
        name: 'test cost surface 2',
        project,
        min: 1,
        max: 2,
        isDefault: true,
      });
    } catch (e) {
      expect(e.message).toEqual(
        'duplicate key value violates unique constraint "idx_default_cost_surface_for_project"',
      );
    }
  });
});
