import React, { useCallback, useState } from 'react';

import Wrapper from 'layout/wrapper';

import Button from 'components/button';
import Loading from 'components/loading';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';

import {
  composeValidators,
} from 'components/forms/validations';

import { useMe, useSaveMe } from 'hooks/me';
import { useToasts } from 'hooks/toast';

import USER_SVG from 'svgs/ui/user.svg?sprite';
import EMAIL_SVG from 'svgs/ui/email.svg?sprite';

export interface MeProps {

}

export const Me: React.FC<MeProps> = () => {
  const [submitting, setSubmitting] = useState(false);
  const { user, isFetching } = useMe();
  const mutation = useSaveMe({});
  const { addToast } = useToasts();

  const handleSubmit = useCallback(async (data) => {
    setSubmitting(true);

    mutation.mutate({ data }, {
      onSuccess: () => {
        addToast('success-save-me', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Profile data saved</p>
          </>
        ), {
          level: 'success',
        });
        setSubmitting(false);
      },
      onError: () => {
        addToast('error-save-me', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Profile data not saved</p>
          </>
        ), {
          level: 'error',
        });
        setSubmitting(false);
      },
    });
  }, [mutation, addToast]);

  // prevent show anything while session is loading
  if (!user && isFetching) return null;

  const { displayName, email } = user;

  return (
    <Wrapper>
      <FormRFF
        onSubmit={handleSubmit}
        initialValues={{
          displayName,
        }}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit} autoComplete="off" className="relative flex items-center justify-center h-full">
            <div className="w-full max-w-xs">
              <h2 className="mb-5 text-lg font-medium text-center text-gray-600 font-heading">Profile</h2>

              <Loading
                visible={submitting}
                className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
                iconClassName="w-10 h-10 text-primary-500"
              />

              {/* DISPLAY NAME */}
              <div>
                <FieldRFF
                  name="displayName"
                  validate={composeValidators([{ presence: true }])}
                >
                  {(fprops) => (
                    <Field id="login-displayName" {...fprops}>
                      <Label theme="light" className="mb-3 uppercase">Name</Label>
                      <Input theme="light" icon={USER_SVG} />
                    </Field>
                  )}
                </FieldRFF>
              </div>

              {/* EMAIL */}
              <div className="mt-5">
                <Label theme="light" className="mb-3 uppercase">Email</Label>
                <Input theme="light" type="email" icon={EMAIL_SVG} readOnly value={email} disabled />
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
    </Wrapper>
  );
};

export default Me;
