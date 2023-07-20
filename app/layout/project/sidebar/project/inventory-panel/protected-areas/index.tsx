// import ProtectedAreasUploader from 'layout/project/sidebar/project/inventory-panel/protected-areas/protected-areas-uploader';

const InventoryPanelProtectedAreas = (): JSX.Element => {
  return (
    <div className="flex items-start justify-between rounded-xl bg-gray-700 p-6">
      <div className="flex w-full items-start justify-between">
        <div>
          <h3 className="font-sans text-xs font-semibold text-blue-500">Inventory Panel</h3>

          <div className="flex items-baseline space-x-2">
            <h4 className="font-heading text-lg font-medium text-white">Protected Areas</h4>
          </div>
        </div>
        {/* <ProtectedAreasUploader /> */}
      </div>
    </div>
  );
};

export default InventoryPanelProtectedAreas;
