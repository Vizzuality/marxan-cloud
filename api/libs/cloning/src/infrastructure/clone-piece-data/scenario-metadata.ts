import { ResourceKind } from '../../domain';

export interface ScenarioMetadataContent {
  name: string;
  description?: string;
}

export interface ScenarioMetadataRelativePathsType {
  getScenarioMetadataRelativePath: (
    exportResourceKind: ResourceKind,
    exportResourceId: string,
  ) => string;
}

export const ScenarioMetadataRelativePaths: ScenarioMetadataRelativePathsType = {
  getScenarioMetadataRelativePath: (
    exportResourceKind: ResourceKind,
    exportResourceId: string,
  ) =>
    exportResourceKind === ResourceKind.Scenario
      ? `scenario-metadata.json`
      : `scenarios/${exportResourceId}/scenario-metadata.json`,
};
