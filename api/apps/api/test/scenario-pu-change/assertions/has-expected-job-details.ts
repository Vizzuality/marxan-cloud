import { Job } from 'bullmq';

export const HasExpectedJobDetails = (job: Job) =>
  expect(job.data).toMatchInlineSnapshot(
    {
      include: {
        pu: expect.arrayContaining([
          expect.any(String),
          expect.any(String),
          expect.any(String),
        ]),
      },
      scenarioId: expect.any(String),
    },
    `
    Object {
      "exclude": Object {
        "geo": undefined,
        "pu": Array [],
      },
      "include": Object {
        "geo": undefined,
        "pu": ArrayContaining [
          Any<String>,
          Any<String>,
          Any<String>,
        ],
      },
      "makeAvailable": Object {
        "geo": undefined,
        "pu": Array [],
      },
      "scenarioId": Any<String>,
    }
  `,
  );

export const HasExpectedJobDetailsWhenClearing = (job: Job) =>
  expect(job.data).toMatchInlineSnapshot(
    {
      exclude: {
        pu: expect.arrayContaining([expect.any(String)]),
      },
      scenarioId: expect.any(String),
    },
    `
    Object {
      "exclude": Object {
        "pu": ArrayContaining [
          Any<String>,
        ],
      },
      "makeAvailable": Object {
        "pu": Array [],
      },
      "scenarioId": Any<String>,
    }
  `,
  );
