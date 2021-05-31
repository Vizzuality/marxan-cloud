/**
 * example:
 *
 *
 *
 fakeResultResolver = jest.fn();
 const scenariosToken = getRepositoryToken(ScenariosFeaturesView);
 const nonGeoToken = getRepositoryToken(
 RemoteScenarioFeaturesData,
 remoteConnectionName,
 );
 const sandbox = await Test.createTestingModule({
    providers: [
      {
        provide: scenariosToken,
        useValue: {
          metadata: {
            name: 'required-by-base-service-for-logging',
          },
          createQueryBuilder: () => fakeQueryBuilder(fakeResultResolver),
        },
      },
      {
        provide: nonGeoToken,
        useValue: {
          find: jest.fn(),
        },
      },
      ScenarioFeaturesService,
    ],
  }).compile();
 *
 *
 * @param getResultCallback
 */

export const fakeQueryBuilder = <T>(getResultCallback: () => T) => ({
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockResolvedValue(getResultCallback()),
  getMany: jest.fn().mockResolvedValue(getResultCallback()),
  getManyAndCount: jest.fn().mockResolvedValue(getResultCallback()),
  take: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  getQueryAndParameters: jest.fn(),
});
