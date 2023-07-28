import InfoButton from 'components/info-button';
import ProtectedAreasList from 'layout/project/sidebar/project/inventory-panel/protected-areas/list';
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

      <ProtectedAreasList />
      <div className="flex flex-col space-y-6">
        <p className="font-sans text-xs leading-4 text-gray-300">
          UNEP-WCMC and IUCN (2022), Protected Planet: The World Database on Protected Areas (WDPA)
          [On-line], [05/2022], Cambridge, UK: UNEP-WCMC and IUCN.
        </p>
        <p className="font-sans text-xxs font-medium text-white">
          Available at:{' '}
          <a
            href="www.protectedplanet.net"
            className="text-primary-500"
            rel="noreferrer"
            target="_blank"
          >
            www.protectedplanet.net.
          </a>
        </p>
      </div>
    </section>
  );
};

export default InventoryPanelProtectedAreas;
