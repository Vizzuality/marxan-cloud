export const getScenarioStatusMetaData = (obj, tabToDraft, tab, subtab) => {
  const metadata = {
    scenarioEditingMetadata: {
      ...obj,
      [tabToDraft]: 'draft',
      tabStatus: {
        tab: `${tab}`,
        subtab: `${subtab}`,
      },
    },
  };
  return metadata;
};
