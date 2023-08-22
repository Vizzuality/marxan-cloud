export type HeaderItem = {
  className?: string;
  text: string;
  name: string;
  columns: {
    [key: string]: string;
  };
  sorting: string;
  onClick?: (field: string) => void;
};
