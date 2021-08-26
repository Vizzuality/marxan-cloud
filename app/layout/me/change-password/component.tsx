import React, { useCallback, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { signOut } from 'next-auth/client';

import { useSaveMePassword } from 'hooks/me';
import { useToasts } from 'hooks/toast';

import ComingSoon from 'layout/help/coming-soon';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import {
  composeValidators,
} from 'components/forms/validations';
import Loading from 'components/loading';

import PASSWORD_SVG from 'svgs/ui/password.svg?sprite';

export const equalPasswordValidator = (value, allValues) => {
  const { newPassword } = allValues || {};
  if (newPassword !== value) return 'Error';

  return undefined;
};

export interface ChangePasswordProps {

}

export const ChangePassword: React.FC<ChangePasswordProps> = () => {
  const [submitting, setSubmitting] = useState(false);
  const mutation = useSaveMePassword({});
  const { addToast } = useToasts();

  const handleSubmit = useCallback(async (values) => {
    setSubmitting(true);

    const { currentPassword, newPassword } = values;

    const data = {
      currentPassword,
      newPassword,
    };

    mutation.mutate({ data }, {
      onSuccess: () => {
        addToast('success-update-password-me', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Password updated</p>
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
        addToast('error-update-password-me', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Password could not be updated</p>
          </>
        ), {
          level: 'error',
        });
        setSubmitting(false);
      },
    });
  }, [mutation, addToast]);

  return (
    <FormRFF
      onSubmit={handleSubmit}
      initialValues={{}}
    >
      {(props) => (
        <form onSubmit={props.handleSubmit} autoComplete="off" className="relative flex">
          <div className="w-full max-w-xl">
            <h2 className="mb-5 text-lg font-medium text-gray-600 font-heading">Change password</h2>
            <p className="text-sm">
              Choose a new password. Changing your password will sign you out.
              {' '}
              You will need to enter your new password.
            </p>

            <Loading
              visible={submitting}
              className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
              iconClassName="w-10 h-10 text-primary-500"
            />

            <div className="mt-20 md:grid md:grid-cols-2 gap-x-10">
              <div>
                {/* CURRENT PASSWORD */}
                <div className="mt-5 ">
                  <FieldRFF
                    name="currentPassword"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {(fprops) => (
                      <Field id="profile-current-password" {...fprops}>
                        <Label theme="light" className="mb-3 uppercase">Current password</Label>
                        <Input theme="light" icon={PASSWORD_SVG} type="password" />
                      </Field>
                    )}
                  </FieldRFF>
                </div>
              </div>

              <div>
                {/* NEW PASSWORD */}
                <div className="mt-5">
                  <FieldRFF
                    name="newPassword"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {(fprops) => (
                      <Field id="profile-new-password" {...fprops}>
                        <Label theme="light" className="mb-3 uppercase">New password</Label>
                        <Input theme="light" icon={PASSWORD_SVG} type="password" />
                      </Field>
                    )}
                  </FieldRFF>
                </div>

                {/* CONFIRM NEW PASSWORD */}
                <div className="mt-5">
                  <FieldRFF
                    name="confirmPassword"
                    validate={composeValidators([
                      { presence: true },
                      equalPasswordValidator,
                    ])}
                  >
                    {(fprops) => (
                      <Field id="profile-confirm-password" {...fprops}>
                        <Label theme="light" className="mb-3 uppercase">Confirm new password</Label>
                        <Input theme="light" icon={PASSWORD_SVG} type="password" />
                      </Field>
                    )}
                  </FieldRFF>
                </div>

                <div className="mt-5">
                  <ComingSoon>
                    <Button theme="primary" size="s" type="submit" disabled={submitting}>
                      Change password
                    </Button>
                  </ComingSoon>
                </div>

              </div>
            </div>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default ChangePassword;
