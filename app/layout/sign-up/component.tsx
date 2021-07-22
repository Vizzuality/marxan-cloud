import React, { useCallback, useState } from 'react';

import omit from 'lodash/omit';

import ConfirmSignUp from 'layout/sign-up/confirm';
import Wrapper from 'layout/wrapper';

import Link from 'next/link';
import Button from 'components/button';
import Loading from 'components/loading';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';
import Checkbox from 'components/forms/checkbox';

import {
  composeValidators,
  booleanValidator,
} from 'components/forms/validations';

import AUTHENTICATION from 'services/authentication';
import { signIn } from 'next-auth/client';
import { useToasts } from 'hooks/toast';

import USER_SVG from 'svgs/ui/user.svg?sprite';
import EMAIL_SVG from 'svgs/ui/email.svg?sprite';
import PASSWORD_SVG from 'svgs/ui/password.svg?sprite';

export interface SignUpProps {

}

export const SignUp: React.FC<SignUpProps> = () => {
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToasts();
  const [confirm, setConfirm] = useState(false);

  const handleSubmit = useCallback(async (data) => {
    setSubmitting(true);

    try {
      const signUpResponse = await AUTHENTICATION
        .request({
          method: 'POST',
          url: '/sign-up',
          data: omit(data, 'checkbox'),
        });
      // There is an inconsistency on the API
      // where username is used for log in instead of email
      if (signUpResponse.status === 201) {
        setConfirm(true);
        await signIn('credentials', { ...data, username: data.email });
      }
    } catch (error) {
      const { data: { errors } } = error.response;

      addToast('error-signup', (
        <>
          <h2 className="font-medium">Error!</h2>
          <ul>
            {errors.map(({ title }) => (
              <li key={title}>
                <p className="text-sm">
                  { title || 'Ooops! Something went wrong. Try again'}
                </p>
              </li>
            ))}
          </ul>
        </>
      ), {
        level: 'error',
      });

      setSubmitting(false);
    }
  }, [addToast]);

  return (
    <Wrapper>
      {!confirm && (
        <FormRFF
          onSubmit={handleSubmit}
        >
          {(props) => (
            <form onSubmit={props.handleSubmit} autoComplete="off" className="relative flex items-center justify-center h-full">

              <div className="w-full max-w-xs">
                <h2 className="mb-5 text-lg font-medium text-center text-gray-600 font-heading">Get Started!</h2>

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
                  <FieldRFF
                    name="email"
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

                <div className="mt-7">
                  <FieldRFF
                    name="checkbox"
                    type="checkbox"
                    validate={composeValidators([booleanValidator])}
                  >
                    {(fprops) => (
                      <Field className="flex mt-2" id="form-checkbox" {...fprops}>
                        <Checkbox theme="light" />
                        <Label theme="light" className="pr-20 ml-2 -mt-1 font-sans text-sm">I accept the Terms of service and privacy policy</Label>
                      </Field>
                    )}
                  </FieldRFF>
                </div>

                <div className="mt-10">
                  <Button theme="primary" size="lg" type="submit" disabled={submitting} className="w-full">
                    Sign up
                  </Button>
                </div>

                <div className="mt-5 text-sm text-center text-black">
                  Already registered.
                  {' '}
                  <Link href="/auth/sign-in"><a href="/auth/sign-in" className="underline">Sign in</a></Link>
                </div>
              </div>

            </form>
          )}
        </FormRFF>
      )}
      {confirm && (
        <ConfirmSignUp setConfirm={setConfirm} />
      )}
    </Wrapper>
  );
};

export default SignUp;
