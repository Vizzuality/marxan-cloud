import React, { useCallback, useState } from 'react';

import Avatar from 'layout/me/profile/avatar';

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

export const Profile: React.FC<MeProps> = () => {
  const [submitting, setSubmitting] = useState(false);
  const { user } = useMe();
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

  const { displayName, email, avatarDataUrl } = user;

  return (
    <FormRFF
      onSubmit={handleSubmit}
      initialValues={{
        displayName,
        avatarDataUrl,
      }}
    >
      {(props) => (
        <form onSubmit={props.handleSubmit} autoComplete="off" className="relative flex">
          <div className="w-full max-w-xs">
            <h2 className="text-5xl font-medium text-gray-600 mb-9 font-heading">My Profile</h2>

            <Loading
              visible={submitting}
              className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
              iconClassName="w-10 h-10 text-primary-500"
            />

            {/* PHOTO */}
            <div>
              <FieldRFF
                name="avatarDataUrl"
              >
                {(fprops) => (
                  <Field id="profile-avatarDataUrl" {...fprops}>
                    <Label theme="light" className="mb-3 uppercase">Photo</Label>
                    <Avatar />
                  </Field>
                )}
              </FieldRFF>
            </div>

            {/* DISPLAY NAME */}
            <div className="mt-8">
              <FieldRFF
                name="displayName"
                validate={composeValidators([{ presence: true }])}
              >
                {(fprops) => (
                  <Field id="profile-displayName" {...fprops}>
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

            <div className="mt-5">
              <Button theme="primary" size="s" type="submit" disabled={submitting}>
                Save changes
              </Button>
            </div>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default Profile;
