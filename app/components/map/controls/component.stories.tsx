import React, { useState } from 'react';
import { Story } from '@storybook/react/types-6-0';

import ZoomControl from 'components/map/controls/zoom';

import Controls, { ControlsProps } from './component';

export default {
  title: 'Components/Map/Controls',
  component: Controls,
};

const Template: Story<ControlsProps> = (args) => {
  const [viewport, setViewport] = useState({
    zoom: 3,
    minZoom: 2,
    maxZoom: 10,
  });

  return (
    <Controls {...args}>
      <ZoomControl
        viewport={viewport}
        onZoomChange={(zoom) => {
          setViewport({
            ...viewport,
            zoom,
          });
        }}
      />
    </Controls>
  );
};

export const Default = Template.bind({});
Default.args = {};
