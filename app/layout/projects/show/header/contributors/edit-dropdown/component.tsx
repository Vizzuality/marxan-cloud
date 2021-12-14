import React from 'react';

import { Button } from 'components/button/component';

export interface EditContributorsDropdownProps {
}

export const EditContributorsDropdown: React.FC<EditContributorsDropdownProps> = () => {
  return (
    <div className="absolute z-40 flex flex-col items-center bg-white top-14 -right-2 p-9 rounded-3xl">
      <div className="text-sm text-black">Project members</div>
      <Button
        className="flex-shrink-0 text-xs px-36 whitespace-nowrap"
        theme="primary"
        size="lg"
        onClick={() => console.info('Save Changes')}
      >
        Save changes
      </Button>
    </div>
  );
};

export default EditContributorsDropdown;
