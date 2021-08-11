export const SCENARIO_EDITING_META_DATA_DEFAULT_VALUES = {
  status: {
    'protected-areas': 'draft',
    features: 'draft',
    analysis: 'draft',
    solutions: 'empty',
  },
  tab: 'analysis',
  subtab: null,
};

export const STATUS_VALUES = {
  'protected-areas': {
    features: 'empty',
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
