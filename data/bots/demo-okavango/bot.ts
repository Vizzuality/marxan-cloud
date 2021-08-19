import axiod from "https://deno.land/x/axiod@0.22/mod.ts";
import Process from "https://deno.land/std@0.103.0/node/process.ts";
import {
  dirname,
  fromFileUrl,
  relative,
} from "https://deno.land/std@0.103.0/path/mod.ts";
import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.11.3/mod.ts";

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

const pgClient = new Client(POSTGRES_URL);

const botClient = axiod.create({
  baseURL: settings.apiUrl + "/api/v1",
  headers: {
    Authorization: "Bearer " + jwt,
  },
});

async function sendData(url: string, data: Blob) {
  const formData = new FormData();
  formData.append("file", data, "corsika.zip");

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers: [["authorization", "Bearer " + jwt]],
  });

  return response;
}

const organization = await botClient
  .post("/organizations", {
    name: "Corsika organization",
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
    API_URL + "/api/v1/projects/planning-area/shapefile",
    new Blob([await Deno.readFile(scriptPath + "/corsica.zip")])
  )
).json();

console.log(planningAreaFile);

const planningUnitAreakm2 = 25;

const project = await botClient
  .post("/projects", {
    name: "Corsika project",
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

await pgClient.connect()
await pgClient.queryArray(`INSERT INTO planning_units_geom (the_geom, type, size)
select st_transform(geom, 4326) as the_geom,
'hexagon' as type,
${planningUnitAreakm2} as size from (
  SELECT (ST_HexagonGrid(${Math.sqrt(planningUnitAreakm2) * 1e3},
    ST_Transform(a.the_geom, 3410))).*
    FROM planning_areas a
    WHERE project_id = '${project.data.id}'
) grid
ON CONFLICT ON CONSTRAINT planning_units_geom_the_geom_type_key DO NOTHING;`);
await pgClient.end();

// wait a bit for async job to be picked up and processed
// @DEBT we should check the actual job status
// await new Promise((r) => setTimeout(r, 30e3));

const scenarioStart = Process.hrtime();

const scenario = await botClient
  .post("/scenarios", {
    name: `Corsika scenario`,
    type: "marxan",
    projectId: project.data.id,
    description: "A Corsika scenario",
    wdpaIucnCategories: ["Not Applicable"],
    wdpaThreshold: 30,
    metadata: {
      scenarioEditingMetadata: {
        status: {
          'protected-areas': 'draft',
          features: 'draft',
          analysis: 'draft',
        },
        tab: 'analysis',
        subtab: 'analysis-preview',
      }
    }
  })
  .then((result) => result.data)
  .catch((e) => {
    console.log(e);
  });

const scenarioTook = Process.hrtime(scenarioStart);
console.log(`Scenario creation done in ${scenarioTook[0]} seconds`);

console.log(scenario);

const pantheraPardusFeature = await botClient
  .get(`/projects/${project.data.id}/features?q=pantherapardus`)
  .then((result) => result.data)
  .catch((e) => {
    console.log(e);
  });

console.log(pantheraPardusFeature);

const geoFeatureSpecStart = Process.hrtime();

const geoFeatureSpec = await botClient
  .post(`/scenarios/${scenario.data.id}/features/specification`, {
    status: "created",
    features: [
      {
        kind: "plain",
        featureId: pantheraPardusFeature.data[0].id,
        marxanSettings: {
          prop: 0.3,
          fpf: 1,
        },
      },
    ],
  })
  .then((result) => result.data)
  .catch((e) => {
    console.log(e);
  });

const geoFeatureSpecTook = Process.hrtime(geoFeatureSpecStart);

console.log(
  `Processing of features for scenario done in ${geoFeatureSpecTook[0]} seconds`
);

console.log(geoFeatureSpec);