import React, { useCallback, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import { useResetPassword } from 'hooks/me';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import Loading from 'components/loading';
import PasswordStrength from 'layout/sign-up/password-strenght';
import Wrapper from 'layout/wrapper';

import RECOVER_PASSWORD_SVG from 'svgs/users/reset-password.svg?sprite';

export const equalPasswordValidator = (value, allValues) => {
  const { password } = allValues || {};
  if (password !== value) return 'Error';

  return undefined;
};
export interface ResetPasswordPasswordProps {}

export const ResetPasswordPassword: React.FC<ResetPasswordPasswordProps> = () => {
  const {
    push,
    query: { token: resetToken },
  } = useRouter();
  const mutation = useResetPassword({ resetToken });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { addToast } = useToasts();

  const handleSubmit = useCallback(
    async (values) => {
      setSubmitting(true);

      const { passwordConfirm } = values;
      const data = { passwordConfirm };

      mutation.mutate(
        { data },
        {
          onSuccess: () => {
            setSubmitted(true);
            addToast(
              'success-reset-password',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">You have changed your password.</p>
              </>,
              {
                level: 'success',
              }
            );
            setSubmitting(false);
          },
          onError: () => {
            addToast(
              'error-reset-password',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">It has not been possible to change your password.</p>
              </>,
              {
                level: 'error',
              }
            );
            setSubmitting(false);
          },
        }
      );
    },
    [mutation, addToast]
  );

  return (
    <Wrapper>
      {!submitted && resetToken && (
        <FormRFF onSubmit={handleSubmit}>
          {(props) => (
            <form
              onSubmit={props.handleSubmit}
              autoComplete="off"
              className="relative flex h-full items-center justify-center"
            >
              <div className="w-full max-w-xs">
                <h2 className="mb-5 text-center font-heading text-lg font-medium text-gray-700">
                  Create new password
                </h2>
                <p className="mb-12 text-sm text-gray-600">
                  Your new password must be different from previous used passwords.
                </p>

                <Loading
                  visible={submitting}
                  className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-white bg-opacity-90"
                  iconClassName="w-10 h-10 text-primary-500"
                />

                <div className="flex flex-col space-y-12">
                  <div>
                    <FieldRFF name="password" validate={composeValidators([{ presence: true }])}>
                      {(fprops) => (
                        <Field id="password" {...fprops}>
                          <Label theme="light" className="mb-3 uppercase">
                            New Password
                          </Label>
                          <Input theme="light" type="password" />
                        </Field>
                      )}
                    </FieldRFF>

                    <PasswordStrength password={props.values.password} />
                  </div>
                  <div>
                    <FieldRFF
                      name="passwordConfirm"
                      validate={composeValidators([{ presence: true }, equalPasswordValidator])}
                    >
                      {(fprops) => (
                        <Field id="password-confirm" {...fprops}>
                          <Label theme="light" className="mb-3 uppercase">
                            Confirm Password
                          </Label>
                          <Input theme="light" type="password" />
                        </Field>
                      )}
                    </FieldRFF>
                  </div>

                  <Button
                    theme="primary"
                    size="lg"
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    Change password
                  </Button>
                </div>
              </div>
            </form>
          )}
        </FormRFF>
      )}

      {submitted && resetToken && (
        <div className="relative flex h-full items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="pb-5">
              <h2 className="mb-24 text-center font-heading text-lg font-medium text-gray-700">
                You&apos;ve changed your password
              </h2>
              <Icon icon={RECOVER_PASSWORD_SVG} className="mx-auto mb-5 h-56 w-56 text-gray-600" />
            </div>
            <div className="mt-10">
              <Button
                theme="tertiary"
                size="lg"
                type="submit"
                disabled={submitting}
                onClick={() => push('/auth/sign-in')}
                className="w-full"
              >
                Ok
              </Button>
            </div>
          </div>
        </div>
      )}
      {!resetToken && (
        <div className="relative flex h-full items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex flex-col items-center space-y-20 pb-5">
              <h2 className="text-center font-heading text-lg font-medium text-gray-700">
                Sorry, you are not allowed to reset your password.
              </h2>
              <p className="mb-12 text-sm text-gray-600">Please check your email inbox.</p>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default ResetPasswordPassword;
