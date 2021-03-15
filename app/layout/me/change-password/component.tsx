import React, { useCallback, useState } from 'react';

import Button from 'components/button';
import Loading from 'components/loading';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';

import {
  composeValidators,
} from 'components/forms/validations';

import { useSaveMePassword } from 'hooks/me';
import { useToasts } from 'hooks/toast';

import PASSWORD_SVG from 'svgs/ui/password.svg?sprite';

export interface ChangePasswordProps {

}

export const ChangePassword: React.FC<ChangePasswordProps> = () => {
  const [submitting, setSubmitting] = useState(false);
  const mutation = useSaveMePassword({});
  const { addToast } = useToasts();

  const handleSubmit = useCallback(async (data) => {
    setSubmitting(true);

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
        <form onSubmit={props.handleSubmit} autoComplete="off" className="relative flex justify-center">
          <div className="w-full max-w-xs">
            <h2 className="mb-5 text-lg font-medium text-center text-gray-600 font-heading">Update password</h2>

            <Loading
              visible={submitting}
              className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
              iconClassName="w-10 h-10 text-primary-500"
            />

            {/* CURRENT PASSWORD */}
            <div className="mt-5">
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

            <div className="mt-10">
              <Button theme="primary" size="lg" type="submit" disabled={submitting} className="w-full">
                Save
              </Button>
            </div>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default ChangePassword;
