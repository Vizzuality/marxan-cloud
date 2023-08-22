const ProtectedAreasTable = ({ noData: noDataMessage }: { noData: string }): JSX.Element => {
  return <div className="flex h-[200px] items-center justify-center">{noDataMessage}</div>;
};

export default ProtectedAreasTable;
