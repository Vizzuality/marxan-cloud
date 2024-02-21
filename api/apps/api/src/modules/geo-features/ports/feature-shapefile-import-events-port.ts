export enum FeatureShapefileImportState {
  FeatureShapefileSubmitted = 'feature-shapefile-upload-submitted',
  FeatureShapefileFinished = 'feature-shapefile-upload-finished',
  FeatureShapefileFailed = 'feature-shapefile-upload-failed',
}

export abstract class FeatureShapefileImportEventsPort {
  abstract event(
    projectId: string,
    state: FeatureShapefileImportState,
    context?: Record<string, unknown> | Error,
  ): Promise<void>;
}
