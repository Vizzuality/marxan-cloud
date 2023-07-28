import InfoButton from 'components/info-button';
import UploadProtectedAreasButton from 'layout/project/sidebar/project/inventory-panel/protected-areas/uploader-btn';

const InventoryPanelProtectedAreas = (): JSX.Element => {
  return (
    <section className="relative space-y-2 rounded-[20px] bg-gray-700 p-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-400">Inventory Panel</span>
          <h3 className="flex items-center space-x-2">
            <span className="text-lg font-medium">Protected Areas</span>
            <InfoButton theme="primary">
              <>
                <h4 className="mb-2.5 font-heading text-lg">What are protected areas?</h4>
              </>
            </InfoButton>
          </h3>
        </div>
        <UploadProtectedAreasButton />
      </header>
      {/* filters */}
      {/* <ProjectFeatureList /> */}
    </section>
  );
};

export default InventoryPanelProtectedAreas;
