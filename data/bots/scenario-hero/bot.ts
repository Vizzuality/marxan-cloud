import axiod from "https://deno.land/x/axiod/mod.ts";
import Process from "https://deno.land/std@0.103.0/node/process.ts";
import { sleep } from "https://deno.land/x/sleep@v1.2.0/mod.ts";

const settings = {
  apiUrl: "http://localhost:3030",
  credentials: {
    "username": "aa@example.com",
    "password": "aauserpassword",
  },
};

const jwt = await axiod.post(
  `${settings.apiUrl}/auth/sign-in/`,
  settings.credentials,
)
  .then((result) => result.data.accessToken);

const botClient = axiod.create({
  baseURL: settings.apiUrl + "/api/v1",
  headers: {
    "Authorization": "Bearer " + jwt,
  },
});

const organization = await botClient.post("/organizations", {
  name: "aliquip nulla ut " + crypto.randomUUID(),
  description: "Duis aliquip nostrud sint",
  metadata: {},
}).then((result) => result.data).catch((e) => {
  console.log(e);
});

console.log(organization);

const project = await botClient.post("/projects", {
  name: "test project " + crypto.randomUUID(),
  organizationId: organization.data.id,
  countryId: "AGO",
  // adminAreaLevel1Id: 'BWA.12_1',
  // adminAreaLevel2Id: 'BWA.12.1_1',
  planningUnitGridShape: "hexagon",
  planningUnitAreakm2: 200,
}).then((result) => result.data).catch((e) => {
  console.log(e);
});

console.log(project);

// wait a bit for async job to be picked up and processed
// @DEBT we should check the actual job status
await sleep(10);

const scenarioStart = Process.hrtime();

const scenario = await botClient.post("/scenarios", {
  name: `test scenario in project ${project.data.attributes.name}`,
  type: "marxan",
  projectId: project.data.id,
  description: "eu et sit",
  // wdpaIucnCategories: ['Not Applicable'],
  // wdpaThreshold: 30
}).then((result) => result.data).catch((e) => {
  console.log(e);
});

const scenarioTook = Process.hrtime(scenarioStart);
console.log(`Scenario creation done in ${scenarioTook[0]}ms`);

console.log(scenario);

const demoGiraffaCamelopardalisFeature = await botClient.get(
  `/projects/${project.data.id}/features?q=iraffa`,
);
await sleep(10);

const scenarioStep2 = await botClient
  .patch(`/scenarios/${scenario!.data!.id}`, {
    wdpaIucnCategories: ["Not Applicable"],
  }).then((result) => result.data).catch((e) => {
    console.log(e);
  });

await sleep(10);

const scenarioStep3 = await botClient
  .patch(`/scenarios/${scenario!.data!.id}`, {
    wdpaThreshold: 10,
  }).then((result) => result.data).catch((e) => {
    console.log(e);
  });

console.log(scenarioStep3);

const pantheraPardusFeature = await botClient.get(
  `/projects/${project.data.id}/features?q=panthera`,
)
  .then((result) => result.data).catch((e) => {
    console.log(e);
  });

console.log(demoGiraffaCamelopardalisFeature);

const geoFeatureSpecStart = Process.hrtime();

const geoFeatureSpec = await botClient.post(
  `/scenarios/${scenario.data.id}/features/specification/v2`,
  {
    status: "created",
    features: [
      {
        kind: "plain",
        featureId: demoGiraffaCamelopardalisFeature.data[0].id,
        marxanSettings: {
          prop: 0.3,
          fpf: 1,
        },
      },
    ],
  },
).then((result) => result.data).catch((e) => {
  console.log(JSON.stringify(e?.response.data?.errors));
});

const geoFeatureSpecTook = Process.hrtime(geoFeatureSpecStart);

console.log(
  `Processing of features for scenario done in ${geoFeatureSpecTook[0]}ms`,
);

console.log(geoFeatureSpec);

await botClient.post(`/scenarios/${scenario.data.id}/marxan`);
