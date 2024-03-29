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
    name: "[demo] Brazil " + crypto.randomUUID(),
    description: "",
  });

  const planningUnitAreakm2 = 50;

  const planningAreaId = await bot.planningAreaUploader.setFromShapefile(
    `${scriptPath}/test_mata.zip`,
  );

  const project = await bot.projects.createInOrganization(organization.id, {
    name: "Brazil " + crypto.randomUUID(),
    description: "",
    planningAreaId: planningAreaId,
    planningUnitGridShape: "hexagon",
    planningUnitAreakm2,
  });

  await bot.asyncJobStatus.waitForPlanningUnitCalculationsFor(project.id);

  const scenario = await bot.scenarios.createInProject(project.id, {
    name: `Brazil - scenario 01`,
    type: "marxan",
    description: "Demo scenario",
    metadata: bot.metadata.analysisPreview(),
  });

  // get the list of protected areas in the region and use all of them
  const paCategories = await bot.protectedAreas
    .getIucnCategoriesForPlanningAreaWithId(planningAreaId);

  await bot.protectedAreas.setForScenario(scenario.id, {
    areas: paCategories.map((category) => ({
      id: category,
      selected: true,
    })),
    threshold: 75,
  });

  await bot.scenarios.update(scenario.id, {
    metadata: bot.metadata.analysisPreview(),
  });

  await bot.asyncJobStatus.waitForPlanningAreaProtectedCalculationFor(
    project.id,
    scenario.id,
    "short",
  );

  //Setup features in the project
  const wantedFeatures = [
    // "demo_ecoregions_new_class_split",
    "buteogallus_urubitinga",
    "caluromys_philander",
    "chiroxiphia_caudata",
    "leopardus_pardalis",
    "megarynchus_pitangua",
    "phyllodytes_tuberculosus",
    "priodontes_maximus",
    "proceratophrys_bigibbosa",
    "tapirus_terrestris",
    "thalurania_glaucopis",
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

  await bot.asyncJobStatus.waitForFeatureSpecificationCalculationFor(
    project.id,
    scenario.id,
    "short",
  );

  await bot.scenarios.setNumberOfRuns(scenario.id, 100);

  await bot.marxanExecutor.runForScenario(scenario.id);

  await bot.asyncJobStatus.waitForMarxanCalculationsFor(
    project.id,
    scenario.id,
    "some",
  );
};
