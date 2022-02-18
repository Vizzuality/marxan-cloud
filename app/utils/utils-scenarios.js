import { ScenarioSidebarTabs } from './tabs';

export const SCENARIO_EDITING_META_DATA_DEFAULT_VALUES = {
  status: {
    'planning-unit': 'draft', // Possible values: empty, draft and outdated
    features: 'draft',
    parameters: 'empty',
    solutions: 'empty',
  },
  tab: ScenarioSidebarTabs.PLANNING_UNIT,
  subtab: null,
};

export const STATUS_VALUES = {
  'planning-unit': {
    parameters: 'empty',
    solutions: 'empty',
  },
  features: {
    parameters: 'empty',
    solutions: 'empty',
  },
  parameters: {
    solutions: 'empty',
  },
  solutions: {
  },
};

export const mergeScenarioStatusMetaData = (
  obj = {},
  { tab, subtab },
  options = { saveTab: true },
) => {
  const { scenarioEditingMetadata = {}, marxanInputParameterFile = {} } = obj;

  const { saveTab } = options;

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
      ...saveTab && {
        tab,
        subtab,
      },
      lastJobCheck: new Date().getTime(),
    },
    marxanInputParameterFile,
  };

  return metadata;
};
