import { ReactChild } from 'react';

export interface UploaderProps {
  id?: string;
  open?: boolean;
  caption?: string;
  children: ReactChild | ReactChild[];
  onOpen: () => void;
  onClose: () => void;
}
