import { INestApplication } from '@nestjs/common';
import { readFileSync } from 'fs';
import { Readable } from 'stream';
import { Job } from 'bullmq';
import { ProtectedAreasJobInput } from '../../../src/modules/protected-areas/worker/worker-input';
import { bootstrapApplication } from '../../utils/geo-application';
import { ProtectedAreaProcessor } from '../../../src/modules/protected-areas/worker/protected-area-processor';
import { v4 } from 'uuid';
import { world } from './steps/given-wdpa-exists';

const shapefile = readFileSync(__dirname + `/shapefile.zip`);
const projectId = v4();

let app: INestApplication;
let sut: ProtectedAreaProcessor;
let sutWorld: ReturnType<typeof world>;
let job: Job;

beforeAll(async () => {
  app = await bootstrapApplication();
  sutWorld = world(app, projectId);
  sut = app.get(ProtectedAreaProcessor);
});

describe(`when worker processes the job for known project`, () => {
  beforeAll(async () => {
    await sutWorld.GivenWdpaExists();
    job = ({ data: input, id: 'test-job' } as unknown) as Job;
  });

  it(`werks`, async () => {
    await sut.process(job);
    await delay(90000);
  }, 120000);
});

afterAll(async () => {
  // await sutWorld.cleanup();
  await app?.close();
}, 500 * 1000);

const file: Express.Multer.File = {
  filename: `shapefile`,
  buffer: shapefile,
  mimetype: 'application/zip',
  path: __dirname + '/shapefile.zip',
  destination: __dirname,
  fieldname: 'attachment',
  size: shapefile.length,
  originalname: 'shapefile.zip',
  stream: Readable.from(shapefile),
  encoding: '',
};

const input: ProtectedAreasJobInput = {
  projectId,
  file,
};

const delay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));
