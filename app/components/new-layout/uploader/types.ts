export interface UploaderProps {
  id?: string;
  open?: boolean;
  caption?: string;
  disabled?: boolean;
  children: React.ReactNode | React.ReactNode[];
  onOpen: () => void;
  onClose: () => void;
}
