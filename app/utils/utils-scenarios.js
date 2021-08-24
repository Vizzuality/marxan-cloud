export const SCENARIO_EDITING_META_DATA_DEFAULT_VALUES = {
  status: {
    'protected-areas': 'draft',
    features: 'draft',
    analysis: 'draft',
  },
  tab: 'analysis',
  subtab: 'analysis-preview',
};

export const STATUS_VALUES = {
  'protected-areas': {
    features: 'empty',
    analysis: 'empty',
  },
  features: {
    analysis: 'empty',
  },
};

export const mergeScenarioStatusMetaData = (obj = {}, { tab, subtab }) => {
  const { scenarioEditingMetadata = {} } = obj;
  const metadata = {
    ...obj,
    scenarioEditingMetadata: {
      status: {
        ...scenarioEditingMetadata.status,
        [tab]: 'draft',
        ...STATUS_VALUES[tab],
      },
      tab: `${tab}`,
      subtab: `${subtab}`,
    },
  };
  return metadata;
};

export const mergeScenarioStatusEditingMetaData = (obj = {}, newObj = { }) => {
  const { scenarioEditingMetadata = {} } = obj;
  const metadata = {
    ...obj,
    scenarioEditingMetadata: {
      ...scenarioEditingMetadata,
      ...newObj,
    },
  };
  return metadata;
};
