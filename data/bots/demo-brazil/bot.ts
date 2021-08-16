import axiod from "https://deno.land/x/axiod@0.22/mod.ts";
import Process from "https://deno.land/std@0.103.0/node/process.ts";
import {
  dirname,
  fromFileUrl,
  relative,
} from "https://deno.land/std@0.103.0/path/mod.ts";
import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.11.3/mod.ts";
import { sleep } from "https://deno.land/x/sleep/mod.ts";

const scriptPath = dirname(relative(Deno.cwd(), fromFileUrl(import.meta.url)));

const { API_URL, USERNAME, PASSWORD, POSTGRES_URL } = config({
  path: scriptPath + "/.env",
});

const settings = {
  apiUrl: API_URL,
  credentials: {
    username: USERNAME,
    password: PASSWORD,
  },
};

const jwt = await axiod
  .post(`${settings.apiUrl}/auth/sign-in/`, settings.credentials)
  .then((result) => result.data.accessToken);

// const pgClient = new Client(POSTGRES_URL);

const botClient = axiod.create({
  baseURL: settings.apiUrl + "/api/v1",
  headers: {
    Authorization: "Bearer " + jwt,
  },
});

async function sendData(url: string, data: Blob) {
  const formData = new FormData();
  formData.append("file", data, "test_mata.zip");

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers: [["authorization", "Bearer " + jwt]],
  });

  return response;
}

const organization = await botClient
  .post("/organizations", {
    name: "Brazil - Atlantic forest " + crypto.randomUUID(),
    description: "Duis aliquip nostrud sint",
    metadata: {},
  })
  .then((result) => result.data)
  .catch((e) => {
    console.log(e);
  });

console.log(organization);

const planningAreaFile = await (
  await sendData(
    settings.apiUrl + "/api/v1/projects/planning-area/shapefile",
    new Blob([await Deno.readFile(scriptPath + "/test_mata.zip")])
  )
).json();

console.log(planningAreaFile);

const planningUnitAreakm2 = 50;

const project = await botClient
  .post("/projects", {
    name: "Brazil " + crypto.randomUUID(),
    organizationId: organization.data.id,
    planningUnitGridShape: "hexagon",
    planningUnitAreakm2: planningUnitAreakm2,
    planningAreaId: planningAreaFile.id,
  })
  .then((result) => result.data)
  .catch((e) => {
    console.log(e);
  });

console.log(project);

// wait a bit for async job to be picked up and processed
// @DEBT we should check the actual job status
// await new Promise((r) => setTimeout(r, 30e3));

const scenarioStart = Process.hrtime();

await sleep(5)

// Scenario creation with the bare minimum; From there we need to be doin patches to the same scenario
let scenario = await botClient
  .post("/scenarios", {
    name: `Brazil ${project.data.attributes.name}`,
    type: "marxan",
    projectId: project.data.id,
    description: "A Brazil scenario",
    status: "draft"
  })
  .then((result) => result.data)
  .catch((e) => {
    console.log(e);
  });

  console.log(scenario);

// get the list of protected areas in the region and use all of them
const paCategories:{data:Array<{id:string, type:string, attributes:object}>} = await botClient.get(`/protected-areas/iucn-categories?filter%5BcustomAreaId%5D=${planningAreaFile.id}`)
          .then((result) =>  result.data)
          .catch((e) => {
            console.log(e);
          });

console.log(paCategories);

await botClient
  .patch(`/scenarios/${scenario!.data!.id}`, {
    wdpaIucnCategories: paCategories!.data.map((i: {id:string, type:string, attributes:object}): string => i.id),
  }).catch((e) => {
    console.log(e);
  });

console.log(scenario);

await sleep(20)

await botClient
  .patch(`/scenarios/${scenario!.data!.id}`, {
    wdpaThreshold: 50,
  }).catch((e) => {
    console.log(e);
  });

const scenarioTook = Process.hrtime(scenarioStart);
console.log(`Scenario creation done in ${scenarioTook[0]} seconds`);

await botClient.get(`/scenarios/${scenario!.data!.id}`)
    .then((result) =>  console.log(result.data))
    .catch((e) => {
    console.log(e);
  });

await sleep(5)

// Setup features in the project

// const featureList = [
//        "demo_ecoregions_new_class_split",
//        "demo_buteogallus_urubitinga",
//        "demo_caluromys_philander",
//        "demo_chiroxiphia_caudata",
//        "demo_leopardus_pardalis",
//        "demo_megarynchus_pitangua",
//        "demo_phyllodytes_tuberculosus",
//        "demo_tapirus_terrestris",
//        "demo_thalurania_glaucopis",
// ]
const features = await botClient
  .get(`/projects/${project.data.id}/features?q=demo`)
  .then((result) => result.data)
  .catch((e) => {
    console.log(e);
  });

console.log(features);

const geoFeatureSpecStart = Process.hrtime();

const featureRecipe = features!.data.map((x: {id:string, type:string, attributes:object}) => { return {
    kind: "plain",
    featureId: x.id,
    marxanSettings: {
      prop: 0.3,
      fpf: 1,
    },
  }})
console.log(featureRecipe);
const geoFeatureSpec = await botClient
  .post(`/scenarios/${scenario.data.id}/features/specification`, {
    status: "created",
    features: featureRecipe
  })
  .then((result) => result.data)
  .catch((e) => {
    console.log(e);
  });

const geoFeatureSpecTook = Process.hrtime(geoFeatureSpecStart);

console.log(
  `Processing of features for scenario done in ${geoFeatureSpecTook[0]} seconds`
);

// console.log(geoFeatureSpec);
