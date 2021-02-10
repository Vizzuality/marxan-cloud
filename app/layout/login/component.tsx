import React, { useCallback } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';
import Button from 'components/button';
import {
  composeValidators,
} from 'components/forms/validations';

import { useAuth } from 'hooks/authentication';

export interface LoginProps {

}

export const Login: React.FC<LoginProps> = () => {
  const auth = useAuth();

  const handleSubmit = useCallback(async (data) => {
    await auth.signin(data);
  }, [auth]);

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
      initialValues={{
        username: 'aa@example.com',
        password: 'aauserpassword',
      }}
    >
      {(props) => (
        <form onSubmit={props.handleSubmit} autoComplete="off">
          {/* EMAIL */}
          <div>
            <FieldRFF
              name="username"
              validate={composeValidators([{ presence: true, email: true }])}
            >
              {(fprops) => (
                <Field id="login-username" {...fprops}>
                  <Label className="mb-3 uppercase">Email</Label>
                  <Input type="email" />
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
                  <Label className="mb-3 uppercase">Password</Label>
                  <Input type="password" />
                </Field>
              )}
            </FieldRFF>
          </div>

          <div className="mt-10">
            <Button theme="primary" size="base" type="submit">
              Sign in
            </Button>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default Login;
