export const SCENARIO_EDITING_META_DATA_DEFAULT_VALUES = {
  status: {
    'planning-unit': 'draft', // Possible values: empty, draft and outdated
    features: 'empty',
    analysis: 'empty',
    solutions: 'empty',
  },
  tab: 'planning-unit',
  subtab: null,
};

export const STATUS_VALUES = {
  'protected-areas': {
    analysis: 'empty',
    solutions: 'empty',
  },
  features: {
    analysis: 'empty',
    solutions: 'empty',
  },
  analysis: {
    solutions: 'empty',
  },
};

export const mergeScenarioStatusMetaData = (obj = {}, { tab, subtab }) => {
  const { scenarioEditingMetadata = {} } = obj;
  const metadata = {
    ...obj,
    scenarioEditingMetadata: {
      ...scenarioEditingMetadata,
      status: {
        ...scenarioEditingMetadata.status,
        [tab]: 'draft',
        ...Object.keys(STATUS_VALUES[tab]).reduce((acc, v) => {
          return {
            ...acc,
            [v]: (scenarioEditingMetadata.status[v] !== 'empty') ? 'outdated' : 'empty',
          };
        }, {}),
      },
      tab: `${tab}`,
      subtab: `${subtab}`,
    },
  };

  return metadata;
};

export const mergeScenarioStatusEditingMetaData = (obj = {}, newObj = {}) => {
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
