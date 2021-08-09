export const getScenarioStatusMetaData = (obj, tab, subtab) => {
  const metadata = {
    scenarioEditingMetadata: {
      ...obj,
      [tab]: 'draft',
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
  } if (tab === 'solutions-details') {
    return 'details';
  } if (tab === 'solutions-gap-analysis') {
    return 'gap-analysis';
  }
  return null;
};
