import React, { useCallback, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import Link from 'next/link';
import { useRouter } from 'next/router';

import omit from 'lodash/omit';
import { signIn } from 'next-auth/react';

import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Loading from 'components/loading';
import Wrapper from 'layout/wrapper';

import AUTHENTICATION from 'services/authentication';

import EMAIL_SVG from 'svgs/ui/email.svg?sprite';
import PASSWORD_SVG from 'svgs/ui/password.svg?sprite';

export interface SignInProps {}

export const SignIn: React.FC<SignInProps> = () => {
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToasts();
  const router = useRouter();
  const { callbackUrl } = router.query;

  const handleSubmit = useCallback(
    async (data) => {
      setSubmitting(true);
      try {
        const signUpResponse = await AUTHENTICATION.request({
          method: 'POST',
          url: '/sign-in',
          data: omit(data, 'checkbox'),
        });

        if (signUpResponse.status === 201) {
          await signIn('credentials', { ...data, callbackUrl });
        }
      } catch (error) {
        addToast(
          'error-signin',
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Invalid username or password.</p>
          </>,
          {
            level: 'error',
          }
        );

        setSubmitting(false);
        console.error(error);
      }
    },
    [addToast, callbackUrl]
  );

  return (
    <Wrapper>
      <FormRFF onSubmit={handleSubmit}>
        {(props) => (
          <form
            onSubmit={props.handleSubmit}
            autoComplete="off"
            className="relative flex h-full items-center justify-center"
          >
            <div className="w-full max-w-xs">
              <h2 className="mb-5 text-center font-heading text-lg font-medium text-gray-700">
                Start planning!
              </h2>

              <Loading
                visible={submitting}
                className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-white bg-opacity-90"
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
                      <Label theme="light" className="mb-3 uppercase">
                        Email
                      </Label>
                      <Input theme="light" type="email" icon={EMAIL_SVG} />
                    </Field>
                  )}
                </FieldRFF>
              </div>

              {/* PASSWORD */}
              <div className="mt-5">
                <FieldRFF name="password" validate={composeValidators([{ presence: true }])}>
                  {(fprops) => (
                    <Field id="login-password" {...fprops}>
                      <Label theme="light" className="mb-3 uppercase">
                        Password
                      </Label>
                      <Input theme="light" type="password" icon={PASSWORD_SVG} />

                      <Link
                        href="/auth/forgot-password"
                        className="mt-2 inline-block text-sm text-gray-600 underline"
                      >
                        Forgot password?
                      </Link>
                    </Field>
                  )}
                </FieldRFF>
              </div>

              <div className="mt-10">
                <Button
                  theme="primary"
                  size="lg"
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                >
                  Sign in
                </Button>
              </div>

              <div className="mt-5 text-center text-sm text-black">
                Don&apos;t have an account?{' '}
                <Link href="/auth/sign-up" className="underline">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        )}
      </FormRFF>
    </Wrapper>
  );
};

export default SignIn;
