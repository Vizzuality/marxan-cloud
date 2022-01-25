export const SCENARIO_EDITING_META_DATA_DEFAULT_VALUES = {
  status: {
    'protected-areas': 'draft',
    features: 'empty',
    analysis: 'empty',
    solutions: 'empty',
  },
  tab: 'protected-areas',
  subtab: 'protected-areas-preview',
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
