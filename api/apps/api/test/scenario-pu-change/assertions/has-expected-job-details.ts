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

export const HasExpectedJobDetailsWhenClearingLockedIn = (job: Job) =>
  expect(job.data).toMatchInlineSnapshot(
    {
      exclude: {
        pu: expect.arrayContaining([expect.any(String)]),
      },
      makeAvailable: {
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
        "pu": ArrayContaining [
          Any<String>,
        ],
      },
      "makeAvailable": Object {
        "pu": ArrayContaining [
          Any<String>,
          Any<String>,
          Any<String>,
        ],
      },
      "scenarioId": Any<String>,
    }
  `,
  );

export const HasExpectedJobDetailsWhenClearingLockedOut = (job: Job) =>
  expect(job.data).toMatchInlineSnapshot(
    {
      include: {
        pu: expect.arrayContaining([expect.any(String)]),
      },
      makeAvailable: {
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
      "include": Object {
        "pu": ArrayContaining [
          Any<String>,
        ],
      },
      "makeAvailable": Object {
        "pu": ArrayContaining [
          Any<String>,
          Any<String>,
          Any<String>,
        ],
      },
      "scenarioId": Any<String>,
    }
  `,
  );

export const HasExpectedJobDetailsWhenClearingAvailable = (job: Job) =>
  expect(job.data).toMatchInlineSnapshot(
    {
      exclude: {
        pu: expect.arrayContaining([expect.any(String), expect.any(String)]),
      },
      include: {
        pu: expect.arrayContaining([expect.any(String)]),
      },
      scenarioId: expect.any(String),
    },
    `
    Object {
      "exclude": Object {
        "pu": ArrayContaining [
          Any<String>,
          Any<String>,
        ],
      },
      "include": Object {
        "pu": ArrayContaining [
          Any<String>,
        ],
      },
      "scenarioId": Any<String>,
    }
  `,
  );
