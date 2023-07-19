import Contributors from 'layout/project/sidebar/project/header/contributors';
import ProjectTitle from 'layout/project/sidebar/project/header/title';

const InventoryProjectHeader = (): JSX.Element => {
  return (
    <div className="flex items-start justify-between">
      <ProjectTitle />
      <Contributors />
    </div>
  );
};

export default InventoryProjectHeader;
