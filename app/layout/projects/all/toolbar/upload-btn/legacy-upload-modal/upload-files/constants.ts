export const LEGACY_FIELDS = [
  {
    label: 'planning unit shapefile',
    format: 'zip',
    fileType: 'planning-grid-shapefile',
    maxSize: 10485760,
    optional: false,
  },
  {
    label: 'input database',
    format: 'dat',
    fileType: 'input',
    maxSize: 1048576,
    optional: false,
  },
  {
    label: 'planning unit file',
    format: 'dat',
    fileType: 'pu',
    maxSize: 1048576,
    optional: false,
  },
  {
    label: 'conservation feature file',
    format: 'dat',
    fileType: 'spec',
    maxSize: 1048576,
    optional: false,
  },
  {
    label: 'planning unit versus conservation feature file',
    format: 'dat',
    fileType: 'puvspr',
    maxSize: 1048576,
    optional: false,
  },
  {
    label: 'output databases',
    format: 'zip',
    fileType: 'output',
    maxSize: 10485760,
    optional: true,
  },
];
