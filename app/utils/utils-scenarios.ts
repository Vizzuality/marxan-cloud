import { ScenarioSidebarTabs } from './tabs';

interface MergeMetadataProps {
  scenarioEditingMetadata?: Record<string, any>;
  marxanInputParameterFile?: Record<string, any>;
}

interface MergeOptionsProps {
  saveTab?: boolean;
  saveStatus?: boolean;
}

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
  obj: MergeMetadataProps = {},
  { tab, subtab },
  options: MergeOptionsProps = { saveTab: true, saveStatus: true },
) => {
  const { scenarioEditingMetadata = {}, marxanInputParameterFile = {} } = obj;

  const { saveTab, saveStatus } = options;

  const metadata = {
    ...obj,
    scenarioEditingMetadata: {
      ...scenarioEditingMetadata,
      status: {
        ...scenarioEditingMetadata.status,
        [tab]: (scenarioEditingMetadata.status[tab] === 'empty' || saveStatus) ? 'draft' : scenarioEditingMetadata.status[tab],
        ...saveStatus && {
          ...Object.keys(STATUS_VALUES[tab]).reduce((acc, v) => {
            return {
              ...acc,
              [v]: (scenarioEditingMetadata.status[v] !== 'empty') ? 'outdated' : 'empty',
            };
          }, {}),
        },
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
