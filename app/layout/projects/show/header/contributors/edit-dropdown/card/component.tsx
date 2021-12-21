import React, { useCallback } from 'react';

import { Form as FormRFF } from 'react-final-form';

import Avatar from 'components/avatar';
import Button from 'components/button';

import { ROLES } from './constants';

export interface ContributorCardProps {
  name: string,
  image?: string,
  roleName: string,
}

export const ContributorCard: React.FC<ContributorCardProps> = ({
  name, image, roleName,
}: ContributorCardProps) => {
  const handleSubmit = useCallback((values) => {
    console.info('values', values);
  }, []);

  return (
    <FormRFF
      onSubmit={handleSubmit}
      initialValues={{}}
    >
      {(props) => (
        <form
          onSubmit={props.handleSubmit}
          autoComplete="off"
          className="box-border flex items-center justify-between w-full py-3 pl-3 pr-6 bg-gray-100 rounded-3xl"

        >
          <div className="flex space-x-3">
            <Avatar
              className="box-border text-sm text-white uppercase border-none bg-primary-700"
              bgImage={image}
              name={name}
              size="lg"
            >
              {!image && name.slice(0, 2)}
            </Avatar>
            <div className="self-center space-y-0.5">
              <p className="text-xs text-black">{name}</p>
              <p className="text-xs text-gray-400">{ROLES[roleName]}</p>
            </div>
          </div>
          <Button
            className="flex-shrink-0 h-6 py-2 text-sm bg-gray-600"
            theme="secondary-alt"
            size="xs"
            type="submit"
          >
            <span className="text-white">Remove</span>
          </Button>
        </form>
      )}
    </FormRFF>
  );
};

export default ContributorCard;
