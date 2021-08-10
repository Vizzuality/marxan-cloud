export const mergeScenarioStatusMetaData = (obj, tab, subtab) => {
  const metadata = {
    scenarioEditingMetadata: {
      ...obj,
      [tab]: 'draft',

      tab: `${tab}`,
      subtab: `${subtab}`,

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
