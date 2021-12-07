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
    name: "[demo] Australia - Kimberley " + crypto.randomUUID(),
    description: "",
  });

  const planningUnitAreakm2 = 25;

  const planningAreaId = await bot.planningAreaUploader.uploadFromFile(
    `${scriptPath}/kimberley.zip`,
  );
  const project = await bot.projects.createInOrganization(organization.id, {
    name: "Australia - Kimberley " + crypto.randomUUID(),
    description: "",
    planningAreaId: planningAreaId,
    planningUnitGridShape: "hexagon",
    planningUnitAreakm2,
  });

  // We don't expose status of planning unit grid calculations yet so we cannot
  // poll for completion of this task, but a reasonable, project-specific wait
  // here will do when there is nothing else keeping the API and PostgreSQL busy.
  await sleep(30);

  // Scenario creation with the bare minimum; From there we need to be setting
  // other traits via patch.
  const scenario = await bot.scenarios.createInProject(project.id, {
    name: `Kimberley - scenario 01`,
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

  await bot.asyncJobStatus.waitForPlanningAreaProtectedCalculationFor(
    project.id,
    scenario.id,
    "short",
  );

  //Setup features in the project
  const wantedFeatures = [
    // "demo_ecoregions_new_class_split",
    "calidris_(erolia)_ferruginea",
    "chlamydosaurus_kingii",
    "erythrura_(chloebia)_gouldiae",
    "haliaeetus_(pontoaetus)_leucogaster",
    "malurus_(malurus)_coronatus",
    "mesembriomys_macrurus",
    "onychogalea_unguifera",
    "pseudechis_australis",
    "wyulda_squamicaudata",
    "zyzomys_woodwardi",
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
    "some",
  );

  await bot.scenarios.setNumberOfRuns(scenario.id, 100);

  await bot.marxanExecutor.runForScenario(scenario.id);

  await bot.asyncJobStatus.waitForMarxanCalculationsFor(
    project.id,
    scenario.id,
    "some",
  );
};
