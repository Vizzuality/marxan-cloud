export interface ItemProps {
  id: string;
  className?: string;
  name: string;
  area: string;
  description: string;
  lastUpdate: string;
  contributors?: Record<string, unknown>[];
  style?: Record<string, unknown>;
  onDownload: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDuplicate: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
