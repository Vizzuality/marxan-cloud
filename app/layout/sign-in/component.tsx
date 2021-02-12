import React, { useCallback, useState } from 'react';

import Button from 'components/button';
import Loading from 'components/loading';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';
import Error from 'components/forms/error';

import {
  composeValidators,
} from 'components/forms/validations';

import { useAuth } from 'hooks/authentication';

import EMAIL_SVG from 'svgs/ui/email.svg?sprite';
import PASSWORD_SVG from 'svgs/ui/password.svg?sprite';

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
        <form onSubmit={props.handleSubmit} autoComplete="off" className="relative">
          <Error visible={error && !submitting}>
            Invalid username or password.
          </Error>

          <Loading
            visible={submitting}
            className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
            iconClassName="w-10 h-10 text-primary-500"
          />

          {/* EMAIL */}
          <div>
            <FieldRFF
              name="username"
              validate={composeValidators([{ presence: true, email: true }])}
            >
              {(fprops) => (
                <Field id="login-username" {...fprops}>
                  <Label theme="light" className="mb-3 uppercase">Email</Label>
                  <Input theme="light" type="email" icon={EMAIL_SVG} />
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
                  <Input theme="light" type="password" icon={PASSWORD_SVG} />
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
