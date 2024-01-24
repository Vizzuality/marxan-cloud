import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Injectable } from '@nestjs/common';
import { CqrsModule, EventBus, IEvent } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { v4 } from 'uuid';
import { DeleteCostSurfaceHandler } from './delete-cost-surface.handler';
import { CostSurfaceDeleted } from '@marxan-api/modules/cost-surface/events/cost-surface-deleted.event';
import {
  DeleteCostSurfaceCommand,
  deleteCostSurfaceFailed,
  DeleteCostSurfaceResponse,
} from '@marxan-api/modules/cost-surface/delete-cost-surface/delete-cost-surface.command';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it('deletes a Cost Surface and emits a CostSurfaceDeleted event', async () => {
  const projectId = fixtures.GivenProjectExits();

  const result = await fixtures.WhenACostSurfaceIsDeleted(projectId);

  fixtures.ThenTrueIsReturned(result);
  await fixtures.ThenCostSurfaceIsDeleted(projectId);
  fixtures.ThenACostSurfaceDeletedEventIsEmitted(projectId);
});

it('fails to delete a project ', async () => {
  const projectId = fixtures.GivenProjectExits();
  fixtures.GivenDeleteOperationFails();

  const result = await fixtures.WhenACostSurfaceIsDeleted(projectId);

  fixtures.ThenDeleteCostSurfaceFailedIsReturned(result);
  await fixtures.ThenCostSurfaceIsNotDeleted(projectId);
  fixtures.ThenNoEventIsEmitted();
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: getRepositoryToken(CostSurface),
        useClass: FakeCostSurfaceRepo,
      },
      DeleteCostSurfaceHandler,
    ],
  }).compile();
  await sandbox.init();
  sandbox.useLogger(new FakeLogger());

  const events: IEvent[] = [];

  const sut = sandbox.get(DeleteCostSurfaceHandler);
  const costSurfaceRepo: FakeCostSurfaceRepo = sandbox.get(
    getRepositoryToken(CostSurface),
  );

  sandbox.get(EventBus).subscribe((event) => {
    events.push(event);
  });

  return {
    GivenProjectExits: () => {
      const projectId = v4();
      costSurfaceRepo.costSurfaces.push({ id: projectId });
      return projectId;
    },
    GivenDeleteOperationFails: () => {
      costSurfaceRepo.failDeleteOperation = true;
    },
    WhenACostSurfaceIsDeleted: async (projectId: string) => {
      return sut.execute(new DeleteCostSurfaceCommand(projectId));
    },
    ThenTrueIsReturned: (result: DeleteCostSurfaceResponse) => {
      if (isLeft(result)) throw new Error('got left expected right');

      expect(result.right).toEqual(true);
    },
    ThenDeleteCostSurfaceFailedIsReturned: (
      result: DeleteCostSurfaceResponse,
    ) => {
      if (isRight(result)) throw new Error('got right expected left');

      expect(result.left).toEqual(deleteCostSurfaceFailed);
    },
    ThenCostSurfaceIsDeleted: async (projectId: string) => {
      const costSurface = await costSurfaceRepo.findOne({
        where: { id: projectId },
      });
      expect(costSurface).toBeUndefined();
    },
    ThenCostSurfaceIsNotDeleted: async (costSurfaceId: string) => {
      const costSurface = await costSurfaceRepo.findOne({
        where: { id: costSurfaceId },
      });
      if (!costSurface) throw new Error('got undefined, expected project');

      expect(costSurface).toEqual({
        id: costSurfaceId,
      });
    },
    ThenACostSurfaceDeletedEventIsEmitted: (costSurfaceId: string) => {
      const costSurfaceDeletedEvent = events[0];

      expect(costSurfaceDeletedEvent).toMatchObject({ costSurfaceId });
      expect(costSurfaceDeletedEvent).toBeInstanceOf(CostSurfaceDeleted);
    },
    ThenNoEventIsEmitted: () => {
      expect(events).toHaveLength(0);
    },
  };
};

@Injectable()
class FakeCostSurfaceRepo {
  public costSurfaces: { id: string }[] = [];
  public failDeleteOperation = false;

  async findOne(conditions: { where: { id: string } }) {
    const res = this.costSurfaces.find(
      (costSurface) => costSurface.id === conditions.where.id,
    );
    return res ? res : undefined;
  }

  async delete(costSurfaceId: string) {
    if (this.failDeleteOperation) throw new Error('delete operation failed');
    const index = this.costSurfaces.findIndex(
      (costSurface) => costSurface.id === costSurfaceId,
    );
    this.costSurfaces.splice(index, 1);
  }
}
