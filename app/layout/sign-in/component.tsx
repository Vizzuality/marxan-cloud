import React, { useCallback, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/client';
import Wrapper from 'layout/wrapper';

import Link from 'next/link';
import Button from 'components/button';
import Loading from 'components/loading';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';

import {
  composeValidators,
} from 'components/forms/validations';

import { useToasts } from 'hooks/toast';

import EMAIL_SVG from 'svgs/ui/email.svg?sprite';
import PASSWORD_SVG from 'svgs/ui/password.svg?sprite';

export interface SignInProps {

}

export const SignIn: React.FC<SignInProps> = () => {
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToasts();
  const [session] = useSession();

  const handleSubmit = useCallback(async (data) => {
    setSubmitting(true);
    try {
      await signIn('credentials', { ...data, callbackUrl: `${window.location.protocol}//${window.location.host}/projects` });
    } catch (err) {
      addToast('error-signin', (
        <>
          <h2 className="font-medium">Error!</h2>
          <p className="text-sm">Invalid username or password.</p>
        </>
      ), {
        level: 'error',
      });

      setSubmitting(false);
      console.error(err);
    }
  }, [addToast]);

  // This shouldn't be here, it's here just for testing
  const handleLogout = useCallback(async () => {
    signOut();
  }, []);

  if (session) {
    return (
      <Button theme="primary" size="base" onClick={handleLogout}>Logout</Button>
    );
  }

  return (
    <Wrapper>
      <FormRFF
        onSubmit={handleSubmit}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit} autoComplete="off" className="relative w-full max-w-xs mx-auto">
            <h2 className="mb-5 text-lg font-medium text-center font-heading">Get in Marxan!</h2>

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
              <Button theme="primary" size="lg" type="submit" disabled={submitting} className="w-full">
                Sign in
              </Button>
            </div>

            <div className="mt-5 text-sm text-center text-black">
              Dont&apos;t have an account?
              {' '}
              <Link href="/auth/sign-up"><a href="/auth/sign-up" className="underline">Sign up</a></Link>
            </div>

          </form>
        )}
      </FormRFF>
    </Wrapper>
  );
};

export default SignIn;
