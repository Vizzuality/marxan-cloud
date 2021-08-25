export interface UploaderProps {
  input: any;
  form: any;
  loading: boolean;
  maxSize?: number;
  multiple?: boolean;
  onDropAccepted: () => void;
  onDropRejected: () => void;
  reset: (form) => void;
}
