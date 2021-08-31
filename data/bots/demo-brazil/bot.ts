import Process from "https://deno.land/std@0.103.0/node/process.ts";
import {
  dirname,
  fromFileUrl,
  relative,
} from "https://deno.land/std@0.103.0/path/mod.ts";
import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
import { sleep } from "https://deno.land/x/sleep@v1.2.0/mod.ts";
import { createBot } from '../lib/libbot/init.ts';
import { SpecificationStatus} from '../lib/libbot/geo-feature-specifications.ts';
import { logInfo, logDebug } from '../lib/libbot/logger.ts';
import _ from 'https://deno.land/x/lodash@4.17.15-es/lodash.js';
import { ScenarioJobKinds, JobStatuses } from '../lib/libbot/scenario-status.ts';

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

const bot = await createBot(settings);

const organization = await bot.organizations.create({
  name: '[BotTest] Brazil ' + crypto.randomUUID(),
  description: '',
});

logInfo('Organization created');
logDebug(organization);

const planningUnitAreakm2 = 1500;

const planningAreaId = await bot.planningAreaUploader.uploadFromFile(`${scriptPath}/test_mata.zip`);

logDebug(planningAreaId);

const project = await bot.projects.createInOrganization(organization.id, {
  name: 'test project ' + crypto.randomUUID(),
  description: '',
  planningAreaId: planningAreaId,
  planningUnitGridShape: 'hexagon',
  planningUnitAreakm2,
});

logInfo('Project created');
logDebug(project);

const scenarioStart = Process.hrtime();

// Scenario creation with the bare minimum; From there we need to be doin patches to the same scenario
const scenario = await bot.scenarios.createInProject(project.id, {
    name: `Brazil scenario`,
    type: "marxan",
    description: "A Brazil scenario",
    metadata: bot.metadata.analysisPreview(),
  });

logDebug(scenario);

// get the list of protected areas in the region and use all of them
const paCategories = await bot.protectedAreas.getIucnCategoriesForPlanningAreaWithId(planningAreaId);

logDebug(paCategories);

const scenarioWithWdpaIucnCategories = await bot.scenarios.update(scenario.id, {
  wdpaIucnCategories: paCategories,
});

logDebug(scenarioWithWdpaIucnCategories);

// await sleep(30)

const scenarioWithThresholdApplied = await bot.scenarios.update(scenario.id, {
  wdpaThreshold: 50,
  metadata: bot.metadata.analysisPreview(),
});

await bot.scenarioStatus.waitForPlanningAreaProtectedCalculationFor(project.id, scenario.id, 'short');

const scenarioTook = Process.hrtime(scenarioStart);
logInfo(`Scenario creation done in ${scenarioTook[0]} seconds`);

logDebug(scenarioWithThresholdApplied);

// await sleep(10)

//Setup features in the project
const wantedFeatures = [
  // "demo_ecoregions_new_class_split",
  // "buteogallus_urubitinga",
  // "caluromys_philander",
  // "chiroxiphia_caudata",
  // "leopardus_pardalis",
  // "megarynchus_pitangua",
  // "phyllodytes_tuberculosus",
  // "priodontes_maximus",
  // "proceratophrys_bigibbosa",
  // "tapirus_terrestris",
  "thalurania_glaucopis",
];

const geoFeatureSpecStart = Process.hrtime();

const geoFeatureIds = await Promise.all(wantedFeatures.map(async f => (await bot.geoFeatures.getIdFromQueryStringInProject(project.id, f))[0]));

logDebug(geoFeatureIds);

const featuresForSpecification = geoFeatureIds.map(i => ({
  kind: "plain",
  featureId: i.id,
  marxanSettings: {
    prop: 0.3,
    fpf: 1,
  },
}));

const geoFeatureSpec = await bot.geoFeatureSpecifications.submitForScenario(scenario.id, featuresForSpecification, SpecificationStatus.created);

await bot.scenarioStatus.waitForFeatureSpecificationCalculationFor(project.id, scenario.id, 'short');

const geoFeatureSpecTook = Process.hrtime(geoFeatureSpecStart);

logInfo(
  `Processing of features for scenario done in ${geoFeatureSpecTook[0]} seconds`
);

logDebug(geoFeatureSpec);

await bot.marxanExecutor.runForScenario(scenario.id);
