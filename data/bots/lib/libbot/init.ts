import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
import {
  dirname,
  fromFileUrl,
  relative,
} from "https://deno.land/std@0.103.0/path/mod.ts";
import { BotHttpClient, MarxanBotConfig } from './marxan-bot.ts';
import { Organizations } from './organizations.ts';
import { Projects } from './projects.ts';
import { Scenarios } from './scenarios.ts';
import { ScenarioEditingMetadata } from './scenario-editing-metadata.ts';
import { PlanningAreaShapefiles } from './planning-area-shapefiles.ts';
import { ProtectedAreas } from './protected-areas.ts';
import { GeoFeatureSpecifications } from './geo-feature-specifications.ts';
import { GeoFeatures } from './geo-features.ts';

const scriptPath = dirname(relative(Deno.cwd(), fromFileUrl(import.meta.url)));

export interface Bot {
  organizations: Organizations;
  projects: Projects;
  scenarios: Scenarios;
  geoFeatures: GeoFeatures;
  geoFeatureSpecifications: GeoFeatureSpecifications;
  planningAreaUploader: PlanningAreaShapefiles;
  protectedAreas: ProtectedAreas;
  metadata: ScenarioEditingMetadata;
}

export const createBot = async (botConfig: MarxanBotConfig): Promise<Bot> => {
  const httpClient = await BotHttpClient.init({
    apiUrl: botConfig?.apiUrl,
    credentials: {
      username: botConfig?.credentials.username,
      password: botConfig?.credentials.password,
    }
  });

  return {
    organizations: new Organizations(httpClient),
    projects: new Projects(httpClient),
    scenarios: new Scenarios(httpClient),
    planningAreaUploader: new PlanningAreaShapefiles(httpClient, botConfig.apiUrl),
    protectedAreas: new ProtectedAreas(httpClient),
    geoFeatures: new GeoFeatures(httpClient),
    geoFeatureSpecifications: new GeoFeatureSpecifications(httpClient),
    metadata: new ScenarioEditingMetadata(),
  }
}
