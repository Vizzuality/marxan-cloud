import InventoryTable from '../../components/inventory-table';

const CostSurfaceTable = ({ noData: noDataMessage }: { noData: string }): JSX.Element => {
  return <InventoryTable loading={false} data={[]} noDataMessage={noDataMessage} />;
};

export default CostSurfaceTable;
