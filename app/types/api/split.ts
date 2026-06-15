import { Feature } from './feature';

/** Marxan settings stored per split child inside the scenario specification. */
export interface SplitMarxanSettings {
  prop?: number;
  fpf?: number;
  target?: number;
}

/**
 * A single split entry as returned by the backend inside
 * geoprocessingOperations[].splits. `featureId` is the REAL materialized
 * child feature id (present once the split job has finished); it is absent
 * while the split is still being materialized.
 */
export interface SplitEntry {
  value: string;
  marxanSettings: SplitMarxanSettings;
  featureId?: Feature['id']; // real child id (read-back; absent while pending)
  amountRange?: { min: number; max: number };
  creationStatus?: Feature['creationStatus'];
}
