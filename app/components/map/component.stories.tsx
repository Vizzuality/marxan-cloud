import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapboxGl } from 'layer-manager';

import Map, { MapProps } from './component';
import LAYERS from './layers';

export default {
  title: 'Components/Map',
  component: Map,
  argTypes: {
    ReactMapGLAttributes: {
      name: 'All ReactMapGL props',
      description: 'http://visgl.github.io/react-map-gl/',
      table: {
        type: {
          summary: 'ReactMapGLAttributes',
        },
      },
      control: {
        disable: true,
      },
    },
    mapboxApiAccessToken: {
      description:
        'http://visgl.github.io/react-map-gl/docs/api-reference/static-map#mapboxapiaccesstoken',
      table: {
        type: {
          summary: 'ReactMapGLAttributes',
        },
      },
      control: {
        disable: true,
      },
    },
    children: {
      control: {
        disable: true,
      },
    },
  },
};

const Template: Story<MapProps> = ({ children, ...args }: MapProps) => (
  <div className="w-full h-96">
    <Map
      {...args}
      mapboxApiAccessToken={process.env.STORYBOOK_MAPBOX_API_TOKEN}
      mapStyle="mapbox://styles/mapbox/dark-v9"
    >
      {(map) => {
        return (
          <LayerManager map={map} plugin={PluginMapboxGl}>
            {LAYERS.map((l) => (
              <Layer key={l.id} {...l} />
            ))}
          </LayerManager>
        );
      }}
    </Map>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  className: '',
  viewport: {},
  bounds: {
    bbox: [
      9.909667968749998,
      43.54854811091286,
      12.19482421875,
      44.35527821160296,
    ],
    options: {},
    viewportOptions: {
      transitionDuration: 0,
    },
  },
  onMapViewportChange: (viewport) => {
    console.info('onMapViewportChange: ', viewport);
  },
  onMapReady: ({ map, mapContainer }) => {
    console.info('onMapReady: ', map, mapContainer);
  },
  onMapLoad: ({ map, mapContainer }) => {
    console.info('onMapLoad: ', map, mapContainer);
  },
};
