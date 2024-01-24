export type HeaderItem = {
  className?: string;
  text: string;
  name: string;
  sorting: string;
  onClick?: (field: string) => void;
};
