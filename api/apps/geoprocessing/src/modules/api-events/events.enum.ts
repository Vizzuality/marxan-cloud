/**
 * duplicated
 * @file api/src/modules/api-events/api-event.topic+kind.api.entity.ts
 */
export enum API_EVENT_KINDS {
  user__signedUp__v1alpha1 = 'user.signedUp/v1alpha1',
  user__accountActivationTokenGenerated__v1alpha1 = 'user.accountActivationTokenGenerated/v1alpha1',
  user__accountActivationSucceeded__v1alpha1 = 'user.accountActivationSucceeded/v1alpha1',
  user__accountActivationFailed__v1alpha1 = 'user.accountActivationFailed/v1alpha1',
  user__passwordResetTokenGenerated__v1alpha1 = 'user.passwordResetTokenGenerated/v1alpha1',
  user__passwordResetSucceeded__v1alpha1 = 'user.passwordResetSucceeded/v1alpha1',
  user__passwordResetFailed__v1alpha1 = 'user.passwordResetFailed/v1alpha1',
}
