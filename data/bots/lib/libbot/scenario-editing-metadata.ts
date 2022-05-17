export class ScenarioEditingMetadata {
  solutionsTab = () => ({
    scenarioEditingMetadata: {
      tab: "solutions",
      status: {
        features: "draft",
        solutions: "draft",
        parameters: "draft",
        "planning-unit": "draft"
      },
      subtab: null,
      lastJobCheck: Date.now(),
    }
  });
}
