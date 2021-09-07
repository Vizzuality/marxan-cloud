import { logDebug } from "../../lib/libbot/logger.ts";
import _ from "https://deno.land/x/lodash@4.17.15-es/lodash.js";
import { Bot } from "../../lib/libbot/init.ts";

export const getDemoFeatureSpecificationFromFeatureNamesForProject = async (
  projectId: string,
  bot: Bot,
  wantedFeatures: string[],
) => {
  const geoFeatureIds = await Promise.all(
    wantedFeatures.map(async (f) =>
      (await bot.geoFeatures.getIdFromQueryStringInProject(projectId, f))[0]
    ),
  );

  logDebug(
    `geoFeatureIds for inclusion in specification:\n${
      Deno.inspect(geoFeatureIds)
    }`,
  );

  const featuresForSpecification = geoFeatureIds.map((i) => ({
    kind: "plain",
    featureId: i.id,
    marxanSettings: {
      prop: 0.3,
      fpf: 1,
    },
  }));

  logDebug(
    `Features for specification:\n${
      Deno.inspect(featuresForSpecification, { depth: 6 })
    }`,
  );

  return featuresForSpecification;
};
