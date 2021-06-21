import { TableRow } from 'components/table/types';

export interface ViewOnMapProps {
  row: TableRow;
  onViewOnMap: (id: string) => void;
}
