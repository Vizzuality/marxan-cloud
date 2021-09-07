import { ReactChild } from 'react';

export interface UploaderProps {
  open?: boolean;
  caption?: string;
  children: ReactChild | ReactChild[];
  onOpen: () => void;
  onClose: () => void;
}
