import { ForCase } from 'apps/geoprocessing/test/integration/planning-unit-inclusion/world';
import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

export const excludeSample = (): FeatureCollection<Polygon | MultiPolygon> => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        stroke: '#555555',
        'stroke-width': 2,
        'stroke-opacity': 1,
        fill: '#d41111',
        'fill-opacity': 0.5,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.91518259048462, 51.65401459280553],
            [-9.913830757141113, 51.65401459280553],
            [-9.913830757141113, 51.65485327420114],
            [-9.91518259048462, 51.65485327420114],
            [-9.91518259048462, 51.65401459280553],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        stroke: '#555555',
        'stroke-width': 2,
        'stroke-opacity': 1,
        fill: '#e81717',
        'fill-opacity': 0.5,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.91007000579834, 51.65272325936179],
            [-9.91000563278198, 51.65215080080787],
            [-9.907822608947754, 51.65220405307135],
            [-9.907844066619873, 51.6532957106858],
            [-9.91000563278198, 51.65330902342127],
            [-9.91007000579834, 51.65272325936179],
          ],
        ],
      },
    },
  ],
});

export const includeSample = (): FeatureCollection<Polygon | MultiPolygon> => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        stroke: '#555555',
        'stroke-width': 2,
        'stroke-opacity': 1,
        fill: '#13be55',
        'fill-opacity': 0.5,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.908766746520996, 51.65438734200841],
            [-9.90965723991394, 51.65394818592163],
            [-9.908895492553711, 51.65398951669091],
            [-9.906202554702759, 51.6539161423378],
            [-9.905773401260376, 51.654413966834184],
            [-9.906063079833984, 51.655252640839656],
            [-9.908766746520996, 51.65438734200841],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        stroke: '#555555',
        'stroke-width': 2,
        'stroke-opacity': 1,
        fill: '#2cc33e',
        'fill-opacity': 0.5,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.914367198944092, 51.652417061499726],
            [-9.91441011428833, 51.65064639851562],
            [-9.909067153930664, 51.65087272771491],
            [-9.91159915924072, 51.65137863595659],
            [-9.911620616912842, 51.652829762481126],
            [-9.914302825927734, 51.652869701086374],
            [-9.914367198944092, 51.652417061499726],
          ],
        ],
      },
    },
  ],
});

export const includeSampleOverlappingWithExclude = (): FeatureCollection<
  Polygon | MultiPolygon
> => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        stroke: '#555555',
        'stroke-width': 2,
        'stroke-opacity': 1,
        fill: '#13be55',
        'fill-opacity': 0.5,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.908766746520996, 51.65438734200841],
            [-9.90965723991394, 51.65384818592163],
            [-9.908895492553711, 51.65298951669091],
            [-9.906202554702759, 51.6530161423378],
            [-9.905773401260376, 51.654413966834184],
            [-9.906063079833984, 51.655252640839656],
            [-9.908766746520996, 51.65438734200841],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        stroke: '#555555',
        'stroke-width': 2,
        'stroke-opacity': 1,
        fill: '#2cc33e',
        'fill-opacity': 0.5,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.914367198944092, 51.652417061499726],
            [-9.91441011428833, 51.65064639851562],
            [-9.909067153930664, 51.65087272771491],
            [-9.91159915924072, 51.65137863595659],
            [-9.911620616912842, 51.652829762481126],
            [-9.914302825927734, 51.652869701086374],
            [-9.914367198944092, 51.652417061499726],
          ],
        ],
      },
    },
  ],
});

export const excludeSampleWithSingleFeature = (): FeatureCollection<
  Polygon | MultiPolygon
> => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        stroke: '#555555',
        'stroke-width': 2,
        'stroke-opacity': 1,
        fill: '#d41111',
        'fill-opacity': 0.5,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.91518259048462, 51.65401459280553],
            [-9.913830757141113, 51.65401459280553],
            [-9.913830757141113, 51.65485327420114],
            [-9.91518259048462, 51.65485327420114],
            [-9.91518259048462, 51.65401459280553],
          ],
        ],
      },
    },
  ],
});

export const includeSampleWithSingleFeature = (): FeatureCollection<
  Polygon | MultiPolygon
> => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        stroke: '#555555',
        'stroke-width': 2,
        'stroke-opacity': 1,
        fill: '#13be55',
        'fill-opacity': 0.5,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.908766746520996, 51.65438734200841],
            [-9.90965723991394, 51.65384818592163],
            [-9.908895492553711, 51.65298951669091],
            [-9.906202554702759, 51.6530161423378],
            [-9.905773401260376, 51.654413966834184],
            [-9.906063079833984, 51.655252640839656],
            [-9.908766746520996, 51.65438734200841],
          ],
        ],
      },
    },
  ],
});

export type AreaUnitSampleGeometryProps = {
  [k in ForCase]: {
    shouldBeExcluded: boolean;
    shouldBeIncluded: boolean;
  };
};

export type AreaUnitSampleGeometry = FeatureCollection<
  MultiPolygon | Polygon,
  AreaUnitSampleGeometryProps
>;

export const areaUnitsSample = (forCase: string): AreaUnitSampleGeometry => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        singleFeature: {
          shouldBeExcluded: true,
          shouldBeIncluded: false,
        },
        multipleFeatures: {
          shouldBeExcluded: true,
          shouldBeIncluded: false,
        },
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.915912151336668, 51.65368177842681],
            [-9.913272857666016, 51.65368177842681],
            [-9.913272857666016, 51.655252640839656],
            [-9.915912151336668, 51.655252640839656],
            [-9.915912151336668, 51.65368177842681],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        singleFeature: {
          shouldBeExcluded: false,
          shouldBeIncluded: false,
        },
        multipleFeatures: {
          shouldBeExcluded: false,
          shouldBeIncluded: false,
        },
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.912950992584229, 51.65366846580083],
            [-9.910526275634766, 51.65366846580083],
            [-9.910526275634766, 51.65526595300033],
            [-9.912950992584229, 51.65526595300033],
            [-9.912950992584229, 51.65366846580083],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        singleFeature: {
          shouldBeExcluded: false,
          shouldBeIncluded: true,
        },
        multipleFeatures: {
          shouldBeExcluded: false,
          shouldBeIncluded: true,
        },
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.910268783569336, 51.65368177842681],
            [-9.907650947570799, 51.65368177842681],
            [-9.907650947570799, 51.65526595300033],
            [-9.910268783569336, 51.65526595300033],
            [-9.910268783569336, 51.65368177842681],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        singleFeature: {
          shouldBeExcluded: false,
          shouldBeIncluded: true,
        },
        multipleFeatures: {
          shouldBeExcluded: false,
          shouldBeIncluded: true,
        },
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.907286167144775, 51.65370840366704],
            [-9.90492582321167, 51.65370840366704],
            [-9.90492582321167, 51.655292577309964],
            [-9.907286167144775, 51.655292577309964],
            [-9.907286167144775, 51.65370840366704],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        singleFeature: {
          shouldBeExcluded: false,
          shouldBeIncluded: false,
        },
        multipleFeatures: {
          shouldBeExcluded: false,
          shouldBeIncluded: true,
        },
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.915912151336668, 51.65199104364197],
            [-9.913272857666016, 51.65199104364197],
            [-9.913272857666016, 51.65345546325333],
            [-9.915912151336668, 51.65345546325333],
            [-9.915912151336668, 51.65199104364197],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        singleFeature: {
          shouldBeExcluded: false,
          shouldBeIncluded: false,
        },
        multipleFeatures: {
          shouldBeExcluded: false,
          shouldBeIncluded: true,
        },
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.912950992584229, 51.65195110426252],
            [-9.91041898727417, 51.65195110426252],
            [-9.91041898727417, 51.653468775941874],
            [-9.912950992584229, 51.653468775941874],
            [-9.912950992584229, 51.65195110426252],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        singleFeature: {
          shouldBeExcluded: false,
          shouldBeIncluded: true,
        },
        multipleFeatures: {
          shouldBeExcluded: true,
          shouldBeIncluded: false,
        },
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.91016149520874, 51.65196441739292],
            [-9.907650947570799, 51.65196441739292],
            [-9.907650947570799, 51.65348208862651],
            [-9.91016149520874, 51.65348208862651],
            [-9.91016149520874, 51.65196441739292],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        singleFeature: {
          shouldBeExcluded: false,
          shouldBeIncluded: true,
        },
        multipleFeatures: {
          shouldBeExcluded: false,
          shouldBeIncluded: false,
        },
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.907286167144775, 51.65195110426252],
            [-9.90490436553955, 51.65195110426252],
            [-9.90490436553955, 51.65349540130722],
            [-9.907286167144775, 51.65349540130722],
            [-9.907286167144775, 51.65195110426252],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        singleFeature: {
          shouldBeExcluded: false,
          shouldBeIncluded: false,
        },
        multipleFeatures: {
          shouldBeExcluded: false,
          shouldBeIncluded: true,
        },
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.915933609008789, 51.65023367765473],
            [-9.913315773010254, 51.65023367765473],
            [-9.913315773010254, 51.6517247804476],
            [-9.915933609008789, 51.6517247804476],
            [-9.915933609008789, 51.65023367765473],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        singleFeature: {
          shouldBeExcluded: false,
          shouldBeIncluded: false,
        },
        multipleFeatures: {
          shouldBeExcluded: false,
          shouldBeIncluded: true,
        },
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.912972450256348, 51.650246991289535],
            [-9.910354614257812, 51.650246991289535],
            [-9.910354614257812, 51.6517247804476],
            [-9.912972450256348, 51.6517247804476],
            [-9.912972450256348, 51.650246991289535],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        singleFeature: {
          shouldBeExcluded: false,
          shouldBeIncluded: false,
        },
        multipleFeatures: {
          shouldBeExcluded: false,
          shouldBeIncluded: true,
        },
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.910075664520262, 51.650246991289535],
            [-9.907586574554443, 51.650246991289535],
            [-9.907586574554443, 51.651764720026485],
            [-9.910075664520262, 51.651764720026485],
            [-9.910075664520262, 51.650246991289535],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        singleFeature: {
          shouldBeExcluded: false,
          shouldBeIncluded: false,
        },
        multipleFeatures: {
          shouldBeExcluded: false,
          shouldBeIncluded: false,
        },
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.907221794128418, 51.65022036401601],
            [-9.904882907867432, 51.65022036401601],
            [-9.904882907867432, 51.6517247804476],
            [-9.907221794128418, 51.6517247804476],
            [-9.907221794128418, 51.65022036401601],
          ],
        ],
      },
    },
  ],
});
