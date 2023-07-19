import Contributors from 'layout/project/sidebar/project/header/contributors';
import ProjectButton from 'layout/project/sidebar/project/header/project-button';
import ProjectTitle from 'layout/project/sidebar/project/header/title';

const InventoryProjectHeader = (): JSX.Element => {
  return (
    <div className="mb-6 flex items-start justify-between">
      <ProjectTitle />
      <div className="mt-4 flex items-center space-x-5">
        <Contributors />
        <ProjectButton />
      </div>
    </div>
  );
};

export default InventoryProjectHeader;
