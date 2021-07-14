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
  project__protectedAreas__submitted__v1__alpha = 'project.protectedAreas.submitted/v1/alpha',
  project__protectedAreas__finished__v1__alpha = 'project.protectedAreas.finished/v1/alpha',
  project__protectedAreas__failed__v1__alpha = 'project.protectedAreas.failed/v1/alpha',
}

export type ScenarioEvents = Pick<
  typeof API_EVENT_KINDS,
  Extract<keyof typeof API_EVENT_KINDS, `scenario__${string}`>
>;
