import { FeatureCollection } from 'geojson';

export const validGeojson: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [17.310575613, -12.7692297],
            [17.265021467, -12.829914224],
            [17.310575613, -12.890613389],
            [17.401683906, -12.890613389],
            [17.447238052, -12.829914224],
            [17.401683906, -12.7692297],
            [17.310575613, -12.7692297],
          ],
        ],
      },
      properties: { puid: 1, cost: 1 },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [17.310575613, -12.647904262],
            [17.265021467, -12.708559739],
            [17.310575613, -12.7692297],
            [17.401683906, -12.7692297],
            [17.447238052, -12.708559739],
            [17.401683906, -12.647904262],
            [17.310575613, -12.647904262],
          ],
        ],
      },
      properties: { puid: 2, cost: 1 },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [17.401683906, -12.526636449],
            [17.310575613, -12.526636449],
            [17.265021467, -12.587263192],
            [17.310575613, -12.647904262],
            [17.401683906, -12.647904262],
            [17.447238052, -12.587263192],
            [17.401683906, -12.526636449],
          ],
        ],
      },
      properties: { puid: 3, cost: 1 },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [17.310575613, -12.042128988],
            [17.265021467, -12.102643902],
            [17.310575613, -12.163172524],
            [17.401683906, -12.163172524],
            [17.447238052, -12.102643902],
            [17.401683906, -12.042128988],
            [17.310575613, -12.042128988],
          ],
        ],
      },
      properties: { puid: 4, cost: 1 },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [17.310575613, -11.921139979],
            [17.265021467, -11.981627706],
            [17.310575613, -12.042128988],
            [17.401683906, -12.042128988],
            [17.447238052, -11.981627706],
            [17.401683906, -11.921139979],
            [17.310575613, -11.921139979],
          ],
        ],
      },
      properties: { puid: 5, cost: 1 },
    },
  ],
};
