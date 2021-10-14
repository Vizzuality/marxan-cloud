import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CryptoTokenFactory, expirationOffsetToken } from './token.factory';
import { Test } from '@nestjs/testing';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`generating token`, async () => {
  const service = fixtures.getFactory();
  const token = await service.create(
    `anUserId`,
    +new Date('2020-01-03T12:00:00Z'),
  );
  expect(token).toStrictEqual({
    createdAt: new Date(`2020-01-03T12:00:00.000Z`),
    expiredAt: new Date(`2020-01-03T12:30:00.000Z`),
    value: expect.stringMatching(/^[a-z0-9]{64}$/),
    userId: 'anUserId',
  });
});

test(`tokens are not the same`, async () => {
  const service = fixtures.getFactory();
  const now = +new Date('2020-01-03T12:00:00Z');
  const token1 = await service.create(`userId1`, now);
  const token2 = await service.create(`userId2`, now);

  expect(token1.value).not.toEqual(token2.value);
});

async function getFixtures() {
  const testingModule = await Test.createTestingModule({
    providers: [
      CryptoTokenFactory,
      {
        provide: expirationOffsetToken,
        useValue: 1000 * 60 * 30,
      },
    ],
  }).compile();
  return {
    getFactory() {
      return testingModule.get(CryptoTokenFactory);
    },
  };
}
