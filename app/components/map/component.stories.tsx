import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Map, { MapProps } from './component';

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
    mapStyle: {
      table: {
        disable: true,
      },
    },
  },
};

const Template: Story<MapProps> = ({ children, ...args }: MapProps) => (
  <div className="w-full h-96">
    <Map {...args}>
      {(map) => {
        console.info(map);
      }}
    </Map>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  mapboxApiAccessToken: process.env.MAPBOX_API_TOKEN,
  className: '',
  viewport: {},
  mapStyle: 'mapbox://styles/mapbox/dark-v9',
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
  children: null,
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
