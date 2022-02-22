import { ValuesType } from 'utility-types';

export enum API_EVENT_KINDS {
  user__signedUp__v1alpha1 = 'user.signedUp/v1alpha1',
  user__accountActivationTokenGenerated__v1alpha1 = 'user.accountActivationTokenGenerated/v1alpha1',
  user__accountActivationSucceeded__v1alpha1 = 'user.accountActivationSucceeded/v1alpha1',
  user__accountActivationFailed__v1alpha1 = 'user.accountActivationFailed/v1alpha1',
  user__passwordResetTokenGenerated__v1alpha1 = 'user.passwordResetTokenGenerated/v1alpha1',
  user__passwordResetSucceeded__v1alpha1 = 'user.passwordResetSucceeded/v1alpha1',
  user__passwordResetFailed__v1alpha1 = 'user.passwordResetFailed/v1alpha1',
  scenario__costSurface__submitted__v1_alpha1 = 'scenario.costSurface.submitted/v1alpha1',
  scenario__costSurface__shapeConverted__v1_alpha1 = 'scenario.costSurface.shapeConverted/v1alpha1',
  scenario__costSurface__shapeConversionFailed__v1_alpha1 = 'scenario.costSurface.shapeConversionFailed/v1alpha1',
  scenario__costSurface__costUpdateFailed__v1_alpha1 = 'scenario.costSurface.costUpdateFailed/v1alpha1',
  scenario__costSurface__finished__v1_alpha1 = 'scenario.costSurface.finished/v1alpha1',
  scenario__planningUnitsInclusion__submitted__v1__alpha1 = 'scenario.planningUnitsInclusion.submitted/v1alpha',
  scenario__planningUnitsInclusion__failed__v1__alpha1 = 'scenario.planningUnitsInclusion.failed/v1alpha',
  scenario__planningUnitsInclusion__finished__v1__alpha1 = 'scenario.planningUnitsInclusion.finished/v1alpha',
  scenario__run__submitted__v1__alpha1 = 'scenario.run.submitted/v1alpha',
  scenario__run__progress__v1__alpha1 = 'scenario.run.progress/v1alpha',
  scenario__run__failed__v1__alpha1 = 'scenario.run.failed/v1alpha',
  scenario__run__outputSaved__v1__alpha1 = 'scenario.run.outputSaved/v1alpha',
  scenario__run__outputSaveFailed__v1__alpha1 = 'scenario.run.outputSaveFailed/v1alpha',
  scenario__run__finished__v1__alpha1 = 'scenario.run.finished/v1alpha',
  scenario__geofeatureCopy__submitted__v1__alpha1 = 'scenario.geofeatureCopy.submitted/v1alpha',
  scenario__geofeatureCopy__failed__v1__alpha1 = 'scenario.geofeatureCopy.failed/v1alpha',
  scenario__geofeatureCopy__finished__v1__alpha1 = 'scenario.geofeatureCopy.finished/v1alpha',
  scenario__geofeatureSplit__submitted__v1__alpha1 = 'scenario.geofeatureSplit.submitted/v1alpha',
  scenario__geofeatureSplit__failed__v1__alpha1 = 'scenario.geofeatureSplit.failed/v1alpha',
  scenario__geofeatureSplit__finished__v1__alpha1 = 'scenario.geofeatureSplit.finished/v1alpha',
  scenario__geofeatureStratification__submitted__v1__alpha1 = 'scenario.geofeatureStratification.submitted/v1alpha',
  scenario__geofeatureStratification__failed__v1__alpha1 = 'scenario.geofeatureStratification.failed/v1alpha',
  scenario__geofeatureStratification__finished__v1__alpha1 = 'scenario.geofeatureStratification.finished/v1alpha',
  scenario__specification__submitted__v1__alpha1 = 'scenario.specification.submitted/v1alpha',
  scenario__specification__failed__v1__alpha1 = 'scenario.specification.failed/v1alpha',
  scenario__specification__finished__v1__alpha1 = 'scenario.specification.finished/v1alpha',
  scenario__featuresWithPuIntersection__submitted__v1__alpha1 = 'scenario.featuresWithPuIntersection.submitted/v1alpha',
  scenario__featuresWithPuIntersection__failed__v1__alpha1 = 'scenario.featuresWithPuIntersection.failed/v1alpha',
  scenario__featuresWithPuIntersection__finished__v1__alpha1 = 'scenario.featuresWithPuIntersection.finished/v1alpha',
  scenario__protectedAreas__submitted__v1__alpha = 'scenario.protectedAreas.submitted/v1/alpha',
  scenario__protectedAreas__finished__v1__alpha = 'scenario.protectedAreas.finished/v1/alpha',
  scenario__protectedAreas__failed__v1__alpha = 'scenario.protectedAreas.failed/v1/alpha',
  project__planningUnits__submitted__v1__alpha = 'project.planningUnits.submitted/v1/alpha',
  project__planningUnits__finished__v1__alpha = 'project.planningUnits.finished/v1/alpha',
  project__planningUnits__failed__v1__alpha = 'project.planningUnits.failed/v1/alpha',
  project__grid__submitted__v1__alpha = 'project.grid.submitted/v1/alpha',
  project__grid__finished__v1__alpha = 'project.grid.finished/v1/alpha',
  project__grid__failed__v1__alpha = 'project.grid.failed/v1/alpha',
  scenario__planningAreaProtectedCalculation__submitted__v1__alpha1 = 'scenario.planningAreaProtectedCalculation.submitted/v1/alpha',
  scenario__planningAreaProtectedCalculation__finished__v1__alpha1 = 'scenario.planningAreaProtectedCalculation.finished/v1/alpha',
  scenario__planningAreaProtectedCalculation__failed__v1__alpha1 = 'scenario.planningAreaProtectedCalculation.failed/v1/alpha',
  scenario__calibration__submitted_v1_alpha1 = 'scenario.calibration.submitted/v1/alpha',
  scenario__calibration__finished_v1_alpha1 = 'scenario.calibration.finished/v1/alpha',
  scenario__calibration__failed_v1_alpha1 = 'scenario.calibration.failed/v1/alpha',
  project__export__submitted__v1__alpha = 'project.export.submitted/v1/alpha',
  project__export__finished__v1__alpha = 'project.export.finished/v1/alpha',
  project__export__failed__v1__alpha = 'project.export.failed/v1/alpha',
  project__export__piece__submitted__v1__alpha = 'project.export.piece.submitted/v1/alpha',
  project__export__piece__finished__v1__alpha = 'project.export.piece.finished/v1/alpha',
  project__export__piece__failed__v1__alpha = 'project.export.piece.failed/v1/alpha',
  scenario__export__submitted__v1__alpha = 'scenario.export.submitted/v1/alpha',
  scenario__export__finished__v1__alpha = 'scenario.export.finished/v1/alpha',
  scenario__export__failed__v1__alpha = 'scenario.export.failed/v1/alpha',
  scenario__export__piece__submitted__v1__alpha = 'scenario.export.piece.submitted/v1/alpha',
  scenario__export__piece__finished__v1__alpha = 'scenario.export.piece.finished/v1/alpha',
  scenario__export__piece__failed__v1__alpha = 'scenario.export.piece.failed/v1/alpha',
  project__import__submitted__v1__alpha = 'project.import.submitted/v1/alpha',
  project__import__finished__v1__alpha = 'project.import.finished/v1/alpha',
  project__import__failed__v1__alpha = 'project.import.failed/v1/alpha',
  project__import__piece__submitted__v1__alpha = 'project.import.piece.submitted/v1/alpha',
  project__import__piece__finished__v1__alpha = 'project.import.piece.finished/v1/alpha',
  project__import__piece__failed__v1__alpha = 'project.import.piece.failed/v1/alpha',
  scenario__import__submitted__v1__alpha = 'scenario.import.submitted/v1/alpha',
  scenario__import__finished__v1__alpha = 'scenario.import.finished/v1/alpha',
  scenario__import__failed__v1__alpha = 'scenario.import.failed/v1/alpha',
  scenario__import__piece__submitted__v1__alpha = 'scenario.import.piece.submitted/v1/alpha',
  scenario__import__piece__finished__v1__alpha = 'scenario.import.piece.finished/v1/alpha',
  scenario__import__piece__failed__v1__alpha = 'scenario.import.piece.failed/v1/alpha',
}

export type ProjectEvents = Pick<
  typeof API_EVENT_KINDS,
  Extract<keyof typeof API_EVENT_KINDS, `project__${string}`>
>;

export type ScenarioEvents = Pick<
  typeof API_EVENT_KINDS,
  Extract<keyof typeof API_EVENT_KINDS, `scenario__${string}`>
>;

export type ScenarioGeoFeatureEventKeys = Extract<
  keyof typeof API_EVENT_KINDS,
  `scenario__geofeature${`Copy` | `Split` | `Stratification`}${string}`
>;
export type ScenarioGeofeatureEvents = Pick<
  typeof API_EVENT_KINDS,
  ScenarioGeoFeatureEventKeys
>;
export type ScenarioGeofeatureEventValues = ValuesType<ScenarioGeofeatureEvents>;
