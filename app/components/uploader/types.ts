export interface UploaderProps {
  caption: string;
  input?: any;
  form?: any;
  loading: boolean;
  maxSize?: number;
  multiple?: boolean;
  successFile: {
    id: string;
    name: string;
  };
  handleSubmit?: (acceptedFiles) => void;
  setSuccessFile: (successFile) => void;
  onDropAccepted?: (acceptedFiles) => void;
  onDropRejected: (rejectedFiles) => void;
  reset: (form) => void;
}
