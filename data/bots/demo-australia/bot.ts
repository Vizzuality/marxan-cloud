import axiod from "https://deno.land/x/axiod/mod.ts";
import Process from 'https://deno.land/std@0.103.0/node/process.ts';

const settings = {
    apiUrl: 'http://localhost:3030',
    credentials: {
        "username": "aa@example.com",
        "password": "aauserpassword"
    }
};

const jwt = await axiod.post(`${settings.apiUrl}/auth/sign-in/`, settings.credentials)
    .then(result => result.data.accessToken);

const botClient = axiod.create({
    baseURL: settings.apiUrl + '/api/v1',
    headers: {
        'Authorization': 'Bearer ' + jwt
    }
});

const organization = await botClient.post('/organizations', {
    name: "aliquip nulla ut " + crypto.randomUUID(),
    description: "Duis aliquip nostrud sint",
    metadata: {}
}).then(result => result.data).catch(e => { console.log(e) });

console.log(organization);

const project = await botClient.post('/projects', {
    name: 'Adelaida-demo ' + crypto.randomUUID(),
    organizationId: organization.data.id,
    countryId: 'BWA',
    adminAreaLevel1Id: 'BWA.12_1',
    adminAreaLevel2Id: 'BWA.12.1_1',
    planningUnitGridShape: 'hexagon',
    planningUnitAreakm2: 16,
}).then(result => result.data).catch(e => { console.log(e) });;

console.log(project);

// wait a bit for async job to be picked up and processed
// @DEBT we should check the actual job status
await new Promise(r => setTimeout(r, 30e3))

const scenarioStart = Process.hrtime();

const scenario = await botClient.post('/scenarios', {
    name: `test scenario in project ${project.data.attributes.name}`,
    type: "marxan",
    projectId: project.data.id,
    description: "eu et sit",
    wdpaIucnCategories: ['Not Applicable'],
    wdpaThreshold: 30
}).then(result => result.data).catch(e => { console.log(e); });

const scenarioTook = Process.hrtime(scenarioStart);
console.log(`Scenario creation done in ${scenarioTook[0]} seconds`);

console.log(scenario);

const pantheraPardusFeature = await botClient.get(`/projects/${project.data.id}/features?q=pantherapardus`)
  .then(result => result.data).catch(e => { console.log(e); });

console.log(pantheraPardusFeature);

const geoFeatureSpecStart = Process.hrtime();

const geoFeatureSpec = await botClient.post(`/scenarios/${scenario.data.id}/features/specification`, {
    status: 'created',
    features: [
      {
        kind: "plain",
        featureId: pantheraPardusFeature.data[0].id,
        marxanSettings: {
            prop: 0.3,
            fpf: 1
        }
      },
    ]
  }).then(result => result.data).catch(e => { console.log(e); });

  const geoFeatureSpecTook = Process.hrtime(geoFeatureSpecStart);

  console.log(`Processing of features for scenario done in ${geoFeatureSpecTook[0]} seconds`);

  console.log(geoFeatureSpec);
