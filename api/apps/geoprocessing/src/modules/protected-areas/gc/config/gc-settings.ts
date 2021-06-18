export interface GcSettings {
  maxAgeForOrphanUploads: string; // '2d'
  gcOn: 1 | 0;
  cronExpression: string;
}
