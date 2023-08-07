import { NavigationTreeCategories } from './types';

export const NAVIGATION_TREE = {
  user: [],
  inventory: ['protected-areas', 'cost-surface', 'features'],
  gridSetup: [
    'protected-areas',
    'protected-areas-threshold',
    'cost-surface',
    'planning-unit-status',
    'features-add',
    'features-target',
  ],
  advancedSettings: ['advanced-settings', 'blm-calibration'],
  solutions: ['solutions', 'target-achievement'],
} satisfies { [key in NavigationTreeCategories]: string[] };

export const MENU_COMMON_CLASSES = 'flex flex-col items-center space-y-2';
export const MENU_ITEM_COMMON_CLASSES =
  'flex group rounded-xl cursor-pointer bg-transparent transition-colors first:mt-2';

export const MENU_ITEM_ACTIVE_CLASSES =
  'group/active bg-primary-400 border-primary-400 hover:border-primary-400';
export const MENU_ITEM_DISABLED_CLASSES = 'pointer-events-none opacity-50';

export const ICONS_COMMON_CLASSES =
  'h-5 w-5 text-gray-400 group-hover:text-white group-[.bg-primary-400]:text-gray-500';

export const MENU_ITEM_BUTTON_COMMON_CLASSES = 'flex p-[10px]';
