import { INestApplication } from '@nestjs/common';
import { PromiseType } from 'utility-types';
import * as request from 'supertest';
import { omit, pick } from 'lodash';
import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { createWorld } from './projects-world';

let app: INestApplication;
let jwtToken: string;
let world: PromiseType<ReturnType<typeof createWorld>>;

beforeAll(async () => {
  app = await bootstrapApplication();
  jwtToken = await GivenUserIsLoggedIn(app);
  world = await createWorld(app, jwtToken);
  if (!world) {
    throw new Error('Could not create fixtures');
  }
});

describe(`When getting all projects`, () => {
  it(`should return relevant data`, async () => {
    const currentProjects = [
      world.projectWithCountry,
      world.projectWithGid1,
      world.projectWithGid2,
    ];
    const response = await request(app.getHttpServer())
      .get(`/api/v1/projects?disablePagination=true`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    const testProjects = response.body.data.filter((project: any) =>
      currentProjects.includes(project.id),
    );

    expect(
      testProjects.map((project: any) =>
        pick(project.attributes, ['planningAreaId', 'planningAreaName']),
      ),
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "planningAreaId": "NAM",
          "planningAreaName": "Namibia",
        },
        Object {
          "planningAreaId": "NAM.13_1",
          "planningAreaName": "Zambezi",
        },
        Object {
          "planningAreaId": "NAM.13.5_1",
          "planningAreaName": "Linyandi",
        },
      ]
    `);
  });
});

describe(`When getting a single project`, () => {
  it(`should return its details`, async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/projects/${world.projectWithGid2}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(
      omit(response.body.data.attributes, [
        'createdAt',
        'lastModifiedAt',
        'name',
      ]),
    ).toMatchInlineSnapshot(`
      Object {
        "adminAreaLevel1Id": "NAM.13_1",
        "adminAreaLevel2Id": "NAM.13.5_1",
        "bbox": Array [
          24.100931167602596,
          23.295501708984375,
          -17.76286506652832,
          -18.50404930114746,
        ],
        "countryId": "NAM",
        "description": null,
        "planningAreaId": "NAM.13.5_1",
        "planningAreaName": "Linyandi",
        "planningUnitAreakm2": null,
        "planningUnitGridShape": null,
      }
    `);
  });
});

afterAll(async () => {
  await world?.cleanup();
  await app.close();
});
