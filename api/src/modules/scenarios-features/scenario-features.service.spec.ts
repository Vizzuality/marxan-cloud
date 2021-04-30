// import { ScenarioFeaturesService } from './scenario-features.service';
// import { Repository } from 'typeorm';
// import { RemoteScenarioFeaturesData } from './entities/remote-scenario-features-data.geo.entity';
// import { Test } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { remoteConnectionName } from './entities/remote-connection-name';
// import {
//   getValidNonGeoData,
//   getValidScenarioFeatures,
// } from './__mocks__/scenario-features.view-data';
// import { fakeQueryBuilder } from '../../utils/__mocks__/fake-query-builder';
//
// let sut: ScenarioFeaturesService;
// let nonGeoFeaturesRepoMock: jest.Mocked<Repository<RemoteScenarioFeaturesData>>;
//
// let fakeResultResolver: jest.Mock;
//
// beforeAll(async () => {
//   fakeResultResolver = jest.fn();
//   // const scenariosToken = getRepositoryToken(ScenariosFeaturesView);
//   const nonGeoToken = getRepositoryToken(
//     RemoteScenarioFeaturesData,
//     remoteConnectionName,
//   );
//   const sandbox = await Test.createTestingModule({
//     providers: [
//       // {
//       //   provide: scenariosToken,
//       //   useValue: {
//       //     metadata: {
//       //       name: 'required-by-base-service-for-logging',
//       //     },
//       //     createQueryBuilder: () => fakeQueryBuilder(fakeResultResolver),
//       //   },
//       // },
//       {
//         provide: nonGeoToken,
//         useValue: {
//           find: jest.fn(),
//         },
//       },
//       ScenarioFeaturesService,
//     ],
//   }).compile();
//
//   sut = sandbox.get(ScenarioFeaturesService);
//   nonGeoFeaturesRepoMock = sandbox.get(nonGeoToken);
// });
//
// describe(`when looking for a scenario's features`, () => {
//   const scenarioId = `scenarioId`;
//   let result: unknown;
//   beforeEach(async () => {
//     // Asset
//     fakeResultResolver.mockResolvedValue(getValidScenarioFeatures(scenarioId));
//     nonGeoFeaturesRepoMock.find.mockResolvedValueOnce(
//       getValidNonGeoData(scenarioId),
//     );
//     // Act
//     result = await sut.findAll({
//       filter: {
//         scenarioId,
//       },
//     });
//   });
//
//   it(`gets expected output`, () => {
//     expect(result).toMatchInlineSnapshot(`
//       Array [
//         Array [
//           Object {
//             "description": "scenario-desc",
//             "featureid": "feature-uuid-1-criteria-met",
//             "id": "scenarioId",
//             "met": 60,
//             "name": "feature-name",
//             "onTarget": true,
//             "projectid": "project-uuid-1",
//             "tag": "scenario-1-tag",
//             "target": 50,
//             "targetArea": 10000,
//           },
//           Object {
//             "description": "scenario-desc",
//             "featureid": "feature-uuid-2-criteria-failed",
//             "id": "scenarioId",
//             "met": 40,
//             "name": "feature-name",
//             "onTarget": false,
//             "projectid": "project-uuid-1",
//             "tag": "scenario-1-tag",
//             "target": 50,
//             "targetArea": 5000,
//           },
//         ],
//         2,
//       ]
//     `);
//   });
// });
//
// // May be useful for other specs
