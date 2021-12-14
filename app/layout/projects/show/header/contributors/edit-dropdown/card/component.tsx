import React, { useCallback } from 'react';

import { Form as FormRFF } from 'react-final-form';

import Avatar from 'components/avatar';
import Button from 'components/button';

export interface ContributorCardProps {
  name: string,
  image: string,
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
          className="flex items-center justify-between w-full p-3 bg-white border rounded-3xl"
          style={{ borderColor: '#00000033' }}
        >
          <div className="flex space-x-3">
            <Avatar
              className="text-sm text-white uppercase bg-primary-700"
              bgImage={image}
              name={name}
            />
            <div>
              <p className="text-xs text-black">{name}</p>
              <p className="text-xs text-black">{roleName}</p>
            </div>
          </div>
          <Button
            className="flex-shrink-0 h-8 py-2 text-sm font-semibold bg-gray-600"
            theme="secondary-alt"
            size="xs"
            type="submit"
          >
            Remove
          </Button>
        </form>
      )}
    </FormRFF>
  );
};

export default ContributorCard;
