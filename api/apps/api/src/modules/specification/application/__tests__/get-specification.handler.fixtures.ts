import { v4 } from 'uuid';
import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { Either, isLeft, isRight } from 'fp-ts/Either';

import { Specification, SpecificationSnapshot } from '../../domain';

import { GetSpecificationHandler } from '../get-specification.handler';
import { SpecificationRepository } from '../specification.repository';
import {
  GetLastUpdatedSpecification,
  GetSpecificationError,
} from '../get-specification.query';

import { InMemorySpecificationRepo } from './in-memory-specification.repo';

export const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CqrsModule],
    providers: [
      {
        provide: SpecificationRepository,
        useClass: InMemorySpecificationRepo,
      },
      GetSpecificationHandler,
    ],
  }).compile();
  await sandbox.init();
  const sut = sandbox.get(GetSpecificationHandler);
  const repo = sandbox.get(SpecificationRepository);

  return {
    WhenGettingLastSpecificationByIds: (ids: string[] = [v4()]) =>
      sut.execute(new GetLastUpdatedSpecification(ids)),
    ThenItIsNotFound(
      result: Either<GetSpecificationError, SpecificationSnapshot>,
    ) {
      expect(isLeft(result)).toBeTruthy();
    },
    GivenSpecificationWasCreated: () => {
      const spec = Specification.from({
        id: v4(),
        raw: {},
        scenarioId: v4(),
        config: [],
        draft: true,
      });
      repo.save(spec);
      return spec.id;
    },
    ThenSpecificationSnapshotIsReturned: (
      result: Either<GetSpecificationError, SpecificationSnapshot>,
    ) => {
      expect(isRight(result)).toBeTruthy();
    },
  };
};
