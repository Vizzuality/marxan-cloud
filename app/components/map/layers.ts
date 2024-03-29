export default [
  // RASTER LAYER
  {
    id: 'gain',
    type: 'raster',
    source: {
      type: 'raster',
      tiles: ['http://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png'],
      minzoom: 3,
      maxzoom: 12,
    },
    render: {
      layers: [
        {
          minzoom: 3, // https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#minzoom
          maxzzom: 12, // https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#maxzoom
          paint: {
            'raster-saturation': -1,
          },
        },
      ],
    },
  },

  // GEOJSON DATA LAYER
  {
    id: 'multipolygon',
    type: 'geojson',
    source: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [10.65673828125, 43.937461690316646],
                  [10.5194091796875, 43.87017822557581],
                  [10.52490234375, 43.757208878849376],
                  [10.6072998046875, 43.6499881760459],
                  [10.72540283203125, 43.71156424665851],
                  [10.75286865234375, 43.7968715826214],
                  [10.755615234375, 43.854335770789575],
                  [10.843505859375, 43.75125720420175],
                  [10.93963623046875, 43.8028187190472],
                  [10.9588623046875, 43.88997537383687],
                  [10.90118408203125, 44.01257086123085],
                  [10.7940673828125, 43.94339481559037],
                  [10.85174560546875, 43.872158236415416],
                  [10.8050537109375, 43.87017822557581],
                  [10.7281494140625, 43.87611806075357],
                  [10.73638916015625, 43.9058083561574],
                  [10.7391357421875, 43.95525928989669],
                  [10.65673828125, 44.008620115415354],
                  [10.65673828125, 43.937461690316646],
                ],
              ],
            },
          },
        ],
      },
    },
    render: {
      layers: [
        {
          type: 'fill',
          paint: {
            'fill-color': '#FFBB00',
            'fill-opacity': 1,
          },
        },
        {
          type: 'line',
          paint: {
            'line-color': '#000000',
            'line-opacity': 0.1,
          },
        },
      ],
    },
  },

  // VECTOR LAYER PROVIDER CARTO
  {
    params: {
      color: '#00BBFF',
    },
    id: 'protected-areas',
    type: 'vector',
    source: {
      type: 'vector',
      provider: {
        type: 'carto',
        account: 'wri-01',
        layers: [
          {
            options: {
              cartocss: '#wdpa_protected_areas {  polygon-opacity: 1.0; polygon-fill: #704489 }',
              cartocss_version: '2.3.0',
              sql: 'SELECT * FROM wdpa_protected_areas',
            },
            type: 'cartodb',
          },
        ],
      },
    },
    render: {
      layers: [
        {
          type: 'fill',
          'source-layer': 'layer0',
          paint: {
            'fill-color': '{color}',
            'fill-opacity': 1,
          },
        },
        {
          type: 'line',
          'source-layer': 'layer0',
          paint: {
            'line-color': '#000000',
            'line-opacity': 0.1,
          },
        },
      ],
    },
  },
];
