import React, { useCallback, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import { signOut } from 'next-auth/client';

import { useResetPassword } from 'hooks/me';
import { useToasts } from 'hooks/toast';

import Wrapper from 'layout/wrapper';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import {
  composeValidators,
} from 'components/forms/validations';
import Icon from 'components/icon';
import Loading from 'components/loading';

import RESET_PASSWORD_SVG from 'svgs/users/reset-password.svg?sprite';

export const equalPasswordValidator = (value, allValues) => {
  const { resetPasswordDraft } = allValues || {};
  if (resetPasswordDraft !== value) return 'Error';

  return undefined;
};
export interface ResetPasswordPasswordProps {

}

export const ResetPasswordPassword: React.FC<ResetPasswordPasswordProps> = () => {
  const mutation = useResetPassword({});
  const { query: { token: resetToken } } = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { addToast } = useToasts();

  const handleSubmit = useCallback(async (values) => {
    setSubmitting(true);

    const { resetPassword } = values;
    const data = { resetPassword };

    mutation.mutate({ data }, {
      onSuccess: () => {
        addToast('success-reset-password', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">You have changed your password.</p>
          </>
        ), {
          level: 'success',
        });
        setSubmitting(false);

        setTimeout(() => {
          signOut();
        });
      },
      onError: () => {
        addToast('error-reset-password', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">It has not possible to change your password.</p>
          </>
        ), {
          level: 'error',
        });
        setSubmitting(false);
      },
    });
  }, [mutation, addToast]);

  return (
    <Wrapper>

      {!submitted && resetToken && (
        <FormRFF
          onSubmit={handleSubmit}
        >
          {(props) => (
            <form onSubmit={props.handleSubmit} autoComplete="off" className="relative flex items-center justify-center h-full">
              <div className="w-full max-w-xs">
                <h2 className="mb-5 text-lg font-medium text-center text-gray-600 font-heading">Create new password</h2>
                <p className="mb-12 text-sm text-gray-500">Your new password must be different from previous used passwords.</p>

                <Loading
                  visible={submitting}
                  className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
                  iconClassName="w-10 h-10 text-primary-500"
                />

                <div className="flex flex-col space-y-12">
                  <FieldRFF
                    name="resetPasswordDraft"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {(fprops) => (
                      <Field id="reset-password-draft" {...fprops}>
                        <Label theme="light" className="mb-3 uppercase">New Password</Label>
                        <Input theme="light" type="password" />
                      </Field>
                    )}
                  </FieldRFF>
                  <FieldRFF
                    name="resetPassword"
                    validate={composeValidators([
                      { presence: true },
                      equalPasswordValidator,
                    ])}
                  >
                    {(fprops) => (
                      <Field id="reset-password" {...fprops}>
                        <Label theme="light" className="mb-3 uppercase">Confirm Password</Label>
                        <Input theme="light" type="password" />
                      </Field>
                    )}
                  </FieldRFF>

                  <Button theme="primary" size="lg" type="submit" disabled={submitting} className="w-full">
                    Change password
                  </Button>
                </div>
              </div>

            </form>
          )}
        </FormRFF>
      )}

      {submitted && resetToken && (
        <div className="relative flex items-center justify-center h-full">
          <div className="w-full max-w-xs">
            <div className="pb-5">
              <h2 className="mb-24 text-lg font-medium text-center text-gray-600 font-heading">You&apos;ve changed your password</h2>
              <Icon icon={RESET_PASSWORD_SVG} className="w-56 h-56 mx-auto mb-5 text-gray-500" />
            </div>
            <div className="mt-10">
              <Button
                theme="tertiary"
                size="lg"
                type="submit"
                disabled={submitting}
                onClick={() => setSubmitted(false)}
                className="w-full"
              >
                Ok
              </Button>
            </div>
          </div>
        </div>
      )}
      {!resetToken && (
        <div className="relative flex items-center justify-center h-full">
          <div className="w-full max-w-xs">
            <div className="flex flex-col items-center pb-5 space-y-20">
              <h2 className="text-lg font-medium text-center text-gray-600 font-heading">
                Sorry, you are not allowed to reset your password.
              </h2>
              <p className="mb-12 text-sm text-gray-500">
                Please check your email inbox.
              </p>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default ResetPasswordPassword;
