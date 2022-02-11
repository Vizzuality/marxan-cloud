import { ResourceKind } from '../../domain';

export interface ScenarioMetadataContent {
  name: string;
  description?: string;
}

export function getScenarioMetadataRelativePath(
  exportResourceKind: ResourceKind,
  exportResourceId: string,
): string {
  return exportResourceKind === ResourceKind.Scenario
    ? `scenario-metadata.json`
    : `scenarios/${exportResourceId}/scenario-metadata.json`;
}
