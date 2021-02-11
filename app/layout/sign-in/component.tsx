import React, { useCallback, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';
import Error from 'components/forms/error';
import Button from 'components/button';
import {
  composeValidators,
} from 'components/forms/validations';

import { useAuth } from 'hooks/authentication';

export interface SignInProps {

}

export const SignIn: React.FC<SignInProps> = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const auth = useAuth();

  const handleSubmit = useCallback(async (data) => {
    setSubmitting(true);

    try {
      await auth.signin(data);
    } catch (err) {
      setSubmitting(false);
      setError(true);
      console.error(err);
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
          <Error visible={error && !submitting}>
            Invalid username or password.
          </Error>

          {/* EMAIL */}
          <div>
            <FieldRFF
              name="username"
              validate={composeValidators([{ presence: true, email: true }])}
            >
              {(fprops) => (
                <Field id="login-username" {...fprops}>
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
              Sign in
            </Button>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default SignIn;
