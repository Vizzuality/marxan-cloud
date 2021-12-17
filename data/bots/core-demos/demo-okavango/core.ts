import {
  dirname,
  fromFileUrl,
  relative,
} from "https://deno.land/std@0.103.0/path/mod.ts";
import { sleep } from "https://deno.land/x/sleep@v1.2.0/mod.ts";
import { createBot } from "../../lib/libbot/init.ts";
import { MarxanBotConfig } from "../../lib/libbot/marxan-bot.ts";
import { SpecificationStatus } from "../../lib/libbot/geo-feature-specifications.ts";
import { getDemoFeatureSpecificationFromFeatureNamesForProject } from "./lib.ts";

const scriptPath = dirname(relative(Deno.cwd(), fromFileUrl(import.meta.url)));

export const runBot = async (settings: MarxanBotConfig) => {
  const bot = await createBot(settings);

  const organization = await bot.organizations.create({
    name: "[demo] Okavango " + crypto.randomUUID(),
    description: "",
  });

  // This project uses a custom hexagonal grid, which we upload here. The
  // project study area is then set to match the grid.
  //
  // @todo The shapefile zip file is not included in this repository as it is
  // not distributable publicly: it needs to be temporarily placed in this bot's
  // folder before running the bot.
  const planningAreaId = await bot.planningAreaUploader.setFromGridShapefile(
    `${scriptPath}/okavango-grid.zip`,
  );

  // @todo Replace with status polling
  await sleep(10);

  const project = await bot.projects.createInOrganization(organization.id, {
    name: "Okavango " + crypto.randomUUID(),
    description: "",
    planningAreaId: planningAreaId,
    planningUnitGridShape: "from_shapefile",
  });

  // @todo Replace with status polling
  await sleep(10);

  const scenario = await bot.scenarios.createInProject(project.id, {
    name: `Okavango - scenario 01`,
    type: "marxan",
    description: "Demo scenario",
    metadata: bot.metadata.analysisPreview(),
  });

  // get the list of protected areas in the region and use all of them
  const paCategories = await bot.protectedAreas
    .getIucnCategoriesForPlanningAreaWithId(planningAreaId);

  await bot.scenarios.update(scenario.id, {
    wdpaIucnCategories: paCategories,
  });

  await bot.scenarios.update(scenario.id, {
    wdpaThreshold: 50,
    metadata: bot.metadata.analysisPreview(),
  });

  await bot.scenarioStatus.waitForPlanningAreaProtectedCalculationFor(
    project.id,
    scenario.id,
    "short",
  );

  //Setup features in the project
  const wantedFeatures = [
    // "feature_1",
    // "feature_2",
    // etc...
  ];

  const featuresForSpecification =
    await getDemoFeatureSpecificationFromFeatureNamesForProject(
      project.id,
      bot,
      wantedFeatures,
    );

  await bot.geoFeatureSpecifications.submitForScenario(
    scenario.id,
    featuresForSpecification,
    SpecificationStatus.created,
  );

  await bot.scenarioStatus.waitForFeatureSpecificationCalculationFor(
    project.id,
    scenario.id,
    "some",
  );

  await bot.scenarios.setNumberOfRuns(scenario.id, 100);

  await bot.marxanExecutor.runForScenario(scenario.id);

  await bot.scenarioStatus.waitForMarxanCalculationsFor(
    project.id,
    scenario.id,
    "some",
  );
};
