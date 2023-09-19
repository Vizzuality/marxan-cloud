import React, { useCallback, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useMe, useSaveMe } from 'hooks/me';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Loading from 'components/loading';
import Avatar from 'layout/me/profile/avatar';

import EMAIL_SVG from 'svgs/ui/email.svg?sprite';
import USER_SVG from 'svgs/ui/user.svg?sprite';

export interface MeProps {}

export const Profile: React.FC<MeProps> = () => {
  const [submitting, setSubmitting] = useState(false);
  const { data: user } = useMe();
  const mutation = useSaveMe({});
  const { addToast } = useToasts();

  const handleSubmit = useCallback(
    async (data) => {
      setSubmitting(true);

      mutation.mutate(
        { data },
        {
          onSuccess: () => {
            addToast(
              'success-save-me',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Profile data saved</p>
              </>,
              {
                level: 'success',
              }
            );
            setSubmitting(false);
          },
          onError: () => {
            addToast(
              'error-save-me',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">Profile data not saved</p>
              </>,
              {
                level: 'error',
              }
            );
            setSubmitting(false);
          },
        }
      );
    },
    [mutation, addToast]
  );

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
            <h2 className="mb-9 font-heading text-5xl font-medium text-gray-600">My Profile</h2>

            <Loading
              visible={submitting}
              className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-white bg-opacity-90"
              iconClassName="w-10 h-10 text-primary-500"
            />

            {/* PHOTO */}
            <div>
              <FieldRFF name="avatarDataUrl">
                {(fprops) => (
                  <Field id="profile-avatarDataUrl" {...fprops}>
                    <Label theme="light" className="mb-3 uppercase">
                      Photo
                    </Label>
                    <Avatar />
                  </Field>
                )}
              </FieldRFF>
            </div>

            {/* DISPLAY NAME */}
            <div className="mt-8">
              <FieldRFF name="displayName" validate={composeValidators([{ presence: true }])}>
                {(fprops) => (
                  <Field id="profile-displayName" {...fprops}>
                    <Label theme="light" className="mb-3 uppercase">
                      Name
                    </Label>
                    <Input theme="light" icon={USER_SVG} />
                  </Field>
                )}
              </FieldRFF>
            </div>

            {/* EMAIL */}
            <div className="mt-7">
              <Label theme="light" className="mb-3 uppercase">
                Email
              </Label>
              <Input theme="light" type="email" icon={EMAIL_SVG} readOnly value={email} disabled />
            </div>

            <div className="mt-7">
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
