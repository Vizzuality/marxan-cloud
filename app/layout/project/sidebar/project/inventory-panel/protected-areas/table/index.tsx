import InventoryTable from '../../components/inventory-table';

const ProtectedAreasTable = ({ noData: noDataMessage }: { noData: string }): JSX.Element => {
  return <InventoryTable loading={false} data={[]} noDataMessage={noDataMessage} />;
};

export default ProtectedAreasTable;
