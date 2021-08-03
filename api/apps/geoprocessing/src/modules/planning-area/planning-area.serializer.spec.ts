import { BBox, GeoJSON } from 'geojson';
import { PuSizes } from './pu-sizes';
import { PlanningAreaSerializer } from './planning-area.serializer';

const input = (): {
  id: string;
  data: GeoJSON;
  bbox: BBox;
} & PuSizes => ({
  id: 'id1',
  data: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [-34.453125, 47.517200697839414],
        },
      },
    ],
  },
  bbox: [1, 2, 3, 4],
  minPuAreaSize: 20,
  maxPuAreaSize: 21,
});

test(`should create dto with all fields`, () => {
  expect(new PlanningAreaSerializer().serialize(input()))
    .toMatchInlineSnapshot(`
    PlanningAreaDto {
      "data": Object {
        "bbox": Array [
          1,
          2,
          3,
          4,
        ],
        "features": Array [
          Object {
            "geometry": Object {
              "coordinates": Array [
                -34.453125,
                47.517200697839414,
              ],
              "type": "Point",
            },
            "properties": Object {},
            "type": "Feature",
          },
        ],
        "marxanMetadata": Object {
          "maxPuAreaSize": 21,
          "minPuAreaSize": 20,
        },
        "type": "FeatureCollection",
      },
      "id": "id1",
    }
  `);
});
