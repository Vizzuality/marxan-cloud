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

export const getReloadTab = (tab) => {
  if (tab === 'analysis-gap-analysis') {
    return 'gap-analysis';
  } if (tab === 'analysis-cost-surface') {
    return 'cost-surface';
  } if (tab === 'analysis-adjust-planning-units') {
    return 'adjust-planning-units';
  }
  return null;
};
