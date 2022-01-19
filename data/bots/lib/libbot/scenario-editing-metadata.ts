export class ScenarioEditingMetadata {
  analysisPreview = () => ({
    scenarioEditingMetadata: {
      status: {
        "protected-areas": "draft",
        features: "empty",
        analysis: "empty",
      },
      tab: "protected-areas",
      subtab: "protected-areas-preview",
      lastJobCheck: new Date().getTime(),
    },
  });
}
