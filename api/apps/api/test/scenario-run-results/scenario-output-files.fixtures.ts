import * as archiver from 'archiver';
import * as unzipper from 'unzipper';
import * as request from 'supertest';
import { v4 } from 'uuid';
import { createWriteStream, readFileSync, unlinkSync, writeFileSync } from 'fs';

import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppConfig } from '@marxan-api/utils/config.utils';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { ScenarioRoles } from '@marxan-api/modules/access-control/scenarios-acl/dto/user-role-scenario.dto';

import { bootstrapApplication } from '../utils/api-application';
import { GivenUserIsLoggedIn } from '../steps/given-user-is-logged-in';
import { GivenScenarioExists } from '../steps/given-scenario-exists';
import { GivenProjectExists } from '../steps/given-project';
import { GivenUserExists } from '../steps/given-user-exists';

export const getFixtures = async () => {
  const app = await bootstrapApplication();
  const ownerToken = await GivenUserIsLoggedIn(app, 'aa');
  const contributorToken = await GivenUserIsLoggedIn(app, 'bb');
  const viewerToken = await GivenUserIsLoggedIn(app, 'cc');
  const contributorUserId = await GivenUserExists(app, 'bb');
  const viewerUserId = await GivenUserExists(app, 'cc');
  const scenarioViewerRole = ScenarioRoles.scenario_viewer;
  const scenarioContributorRole = ScenarioRoles.scenario_contributor;

  const { projectId } = await GivenProjectExists(app, ownerToken, {
    countryId: 'BWA',
    adminAreaLevel1Id: 'BWA.12_1',
    adminAreaLevel2Id: 'BWA.12.1_1',
  });
  const scenario = await GivenScenarioExists(app, projectId, ownerToken);
  const scenarioId = scenario.id;
  const filesToRemove: string[] = [];

  const marxanExecutionMetadataRepo: Repository<MarxanExecutionMetadataGeoEntity> = app.get(
    getRepositoryToken(
      MarxanExecutionMetadataGeoEntity,
      DbConnections.geoprocessingDB,
    ),
  );

  const userScenariosRepo: Repository<UsersScenariosApiEntity> = app.get(
    getRepositoryToken(UsersScenariosApiEntity),
  );

  return {
    cleanup: async () => {
      filesToRemove.forEach((file) => unlinkSync(file));
    },
    GivenContributorWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId: scenarioId,
        roleName: scenarioContributorRole,
        userId: contributorUserId,
      }),
    GivenViewerWasAddedToScenario: async () =>
      await userScenariosRepo.save({
        scenarioId: scenarioId,
        roleName: scenarioViewerRole,
        userId: viewerUserId,
      }),
    GivenOutputZipIsAvailable: async () => {
      const zipBuffer = await createArchive();
      filesToRemove.push(...zipBuffer.filesToClean);
      await marxanExecutionMetadataRepo.save(
        marxanExecutionMetadataRepo.create({
          outputZip: zipBuffer.archive,
          inputZip: Buffer.from('abcd', 'utf-8'),
          scenarioId,
        }),
      );
    },
    WhenGettingZipArchiveAsOwner: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/output`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .responseType('blob'),
    WhenGettingZipArchiveAsContributor: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/output`)
        .set('Authorization', `Bearer ${contributorToken}`)
        .responseType('blob'),
    WhenGettingZipArchiveAsViewer: async () =>
      request(app.getHttpServer())
        .get(`/api/v1/scenarios/${scenarioId}/marxan/output`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .responseType('blob'),
    ThenZipContainsOutputFiles: async (response: request.Response) => {
      expect(response.header['content-type']).toEqual('application/zip');
      expect(response.header[`content-disposition`]).toEqual(
        `attachment; filename="output.zip"`,
      );

      const directory = await unzipper.Open.buffer(response.body);
      expect(directory.files.length).toEqual(1);
      expect(directory.files[0].path).toEqual(`hello.txt`);
      expect((await directory.files[0].buffer()).toString()).toEqual(
        `Hello Marxan!`,
      );
    },
    ThenReturns404: (response: request.Response) => {
      const asJson = JSON.parse(response.body.toString());
      expect(asJson.errors[0].title).toEqual(`Marxan was not yet executed.`);
    },
  };
};

const createArchive = async (): Promise<{
  archive: Buffer;
  filesToClean: string[];
}> =>
  new Promise(async (resolve, reject) => {
    const baseDir = AppConfig.get<string>(
      'storage.sharedFileStorage.localPath',
    ) as string;
    const archiveName = v4();
    const archiveFullPath = `${baseDir}/${archiveName}.zip`;
    const fileName = `hello.txt`;
    const fileFullPath = `${baseDir}/${fileName}`;
    const filesToClean = [archiveFullPath, fileFullPath];

    writeFileSync(fileFullPath, `Hello Marxan!`);

    const fileStream = createWriteStream(archiveFullPath);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    fileStream.on('close', async function () {
      resolve({
        archive: readFileSync(archiveFullPath),
        filesToClean,
      });
    });

    archive.pipe(fileStream);
    archive.on('error', reject);
    archive.on('warning', (err) => {
      if (err.code !== 'ENOENT') {
        reject(err);
      }
    });

    archive.file(fileFullPath, { name: fileName });

    await archive.finalize();
  });
