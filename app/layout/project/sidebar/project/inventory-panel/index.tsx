import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch } from 'store/hooks';
import { setSearch } from 'store/slices/projects/[id]';

import { HiOutlineArrowUpOnSquareStack } from 'react-icons/hi2';

import Button from 'components/button';
import InfoButton from 'components/info-button';
import Search, { SearchProps } from 'components/search';
import { NavigationInventoryTabs } from 'layout/project/navigation/types';
import Section from 'layout/section';

import { INVENTORY_TABS } from './constants';
import { InventoryPanel } from './types';

const InventoryPanel = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { query } = useRouter();
  const { tab } = query as { tab: NavigationInventoryTabs };

  const panel = INVENTORY_TABS[tab] as InventoryPanel;

  const [isOpenUploader, setOpenUploader] = useState(false);

  // Ensure uploader modals are closed if we change panels
  useEffect(() => {
    setOpenUploader(false);
  }, [panel]);

  // Handle upload modals
  const handleUploader = useCallback(() => {
    setOpenUploader(true);
  }, []);

  const closeUploadModal = useCallback(() => {
    setOpenUploader(false);
  }, []);

  // Handle search
  const handleSearch = useCallback(
    (value: Parameters<SearchProps['onChange']>[0]) => {
      dispatch(setSearch(value));
    },
    [dispatch]
  );

  // Shouldn't happen that the panel/tab doesn't exist, but in case it happens let's
  // add a guard to prevent the app from crashing.
  if (!panel) return null;

  const {
    title,
    search,
    noData,
    InfoComponent,
    UploadModalComponent,
    TableComponent,
    FooterComponent,
  } = panel;

  return (
    <Section className="relative flex flex-col space-y-2 overflow-hidden">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-500">Inventory Panel</span>
          <h3 className="flex items-center space-x-2">
            <span className="text-lg font-medium">{title}</span>
            {/* Not all panels have an InfoComponent */}
            {InfoComponent && (
              <InfoButton theme="tertiary">
                <InfoComponent />
              </InfoButton>
            )}
          </h3>
        </div>
        <Button theme="primary" size="base" className="space-x-3" onClick={handleUploader}>
          <span>Upload</span>
          <HiOutlineArrowUpOnSquareStack className="h-5 w-5" />
        </Button>
      </header>
      <Search
        id="inventory-search"
        size="sm"
        placeholder={search}
        aria-label={search}
        onChange={handleSearch}
        theme="dark"
      />
      {TableComponent && <TableComponent noData={noData} />}
      <UploadModalComponent isOpen={isOpenUploader} onDismiss={closeUploadModal} />
      {FooterComponent && <FooterComponent />}
    </Section>
  );
};

export default InventoryPanel;
