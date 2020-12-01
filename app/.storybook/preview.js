import { themes } from '@storybook/theming';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  layout: 'centered',
  docs: {
    theme: themes.dark,
  },
  previewTabs: {
    canvas: { hidden: true },
  },
}
