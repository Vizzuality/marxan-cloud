import React, { useCallback, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';
import Button from 'components/button';
import {
  composeValidators,
} from 'components/forms/validations';

import { useAuth } from 'hooks/authentication';

export interface SignUpProps {

}

export const SignUp: React.FC<SignUpProps> = () => {
  const [submitting, setSubmitting] = useState(false);
  const auth = useAuth();

  const handleSubmit = useCallback(async (data) => {
    setSubmitting(true);

    try {
      await auth.signup(data);
    } catch (error) {
      setSubmitting(false);
      console.error(error);
    }
  }, [auth]);

  // This shouldn't be here, it's here just for testing
  const handleLogout = useCallback(async () => {
    await auth.signout();
  }, [auth]);

  if (auth.user) {
    return (
      <Button theme="primary" size="base" onClick={handleLogout}>Logout</Button>
    );
  }

  return (
    <FormRFF
      onSubmit={handleSubmit}
    >
      {(props) => (
        <form onSubmit={props.handleSubmit} autoComplete="off">
          {/* DISPLAY NAME */}
          <div>
            <FieldRFF
              name="displayName"
              validate={composeValidators([{ presence: true }])}
            >
              {(fprops) => (
                <Field id="login-displayName" {...fprops}>
                  <Label theme="light" className="mb-3 uppercase">Display name</Label>
                  <Input theme="light" />
                </Field>
              )}
            </FieldRFF>
          </div>

          {/* EMAIL */}
          <div className="mt-5">
            <FieldRFF
              name="email"
              validate={composeValidators([{ presence: true, email: true }])}
            >
              {(fprops) => (
                <Field id="login-email" {...fprops}>
                  <Label theme="light" className="mb-3 uppercase">Email</Label>
                  <Input theme="light" type="email" />
                </Field>
              )}
            </FieldRFF>
          </div>

          {/* PASSWORD */}
          <div className="mt-5">
            <FieldRFF
              name="password"
              validate={composeValidators([{ presence: true }])}
            >
              {(fprops) => (
                <Field id="login-password" {...fprops}>
                  <Label theme="light" className="mb-3 uppercase">Password</Label>
                  <Input theme="light" type="password" />
                </Field>
              )}
            </FieldRFF>
          </div>

          <div className="mt-10">
            <Button theme="primary" size="base" type="submit" disabled={submitting} className="w-full">
              Sign up
            </Button>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default SignUp;
