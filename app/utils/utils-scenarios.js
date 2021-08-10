export const mergeScenarioStatusMetaData = (obj, { tab, subtab }) => {
  const { scenarioEditingMetadata } = obj;
  const metadata = {
    ...obj,
    scenarioEditingMetadata: {
      status: {
        ...scenarioEditingMetadata.status,
        [tab]: 'draft',
      },
      tab: `${tab}`,
      subtab: `${subtab}`,
    },
  };
  return metadata;
};

export const getReloadSubtab = (subtab) => {
  if (subtab === 'analysis-gap-analysis') {
    return 'gap-analysis';
  } if (subtab === 'analysis-cost-surface') {
    return 'cost-surface';
  } if (subtab === 'analysis-adjust-planning-units') {
    return 'adjust-planning-units';
  } if (subtab === 'solutions-details') {
    return 'details';
  } if (subtab === 'solutions-gap-analysis') {
    return 'gap-analysis';
  }
  return null;
};
