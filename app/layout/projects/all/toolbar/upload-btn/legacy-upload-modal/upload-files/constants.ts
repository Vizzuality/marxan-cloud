export const LEGACY_FIELDS = [
  {
    label: 'planning unit shapefile',
    format: 'zip',
    fileType: 'planning-grid-shapefile.zip',
    maxSize: 10485760,
    optional: false,
  },
  {
    label: 'input database',
    format: 'dat',
    fileType: 'input.dat',
    maxSize: 1048576,
    optional: false,
  },
  {
    label: 'planning unit file',
    format: 'dat',
    fileType: 'pu.dat',
    maxSize: 1048576,
    optional: false,
  },
  {
    label: 'conservation feature file',
    format: 'dat',
    fileType: 'spec.dat',
    maxSize: 1048576,
    optional: false,
  },
  {
    label: 'planning unit versus conservation feature file',
    format: 'dat',
    fileType: 'puvspr.dat',
    maxSize: 1048576,
    optional: false,
  },
  {
    label: 'output databases',
    format: 'zip',
    fileType: 'output.zip',
    maxSize: 10485760,
    optional: true,
  },
];
