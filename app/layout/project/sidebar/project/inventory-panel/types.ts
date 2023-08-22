export type InventoryPanel = {
  title: string;
  search: string;
  noData: string;
  InfoComponent?: () => JSX.Element;
  // TODO: Remove optional when we have upload modals for all tabs
  UploadModalComponent?: ({
    isOpen,
    onDismiss,
  }: {
    isOpen?: boolean;
    onDismiss: () => void;
  }) => JSX.Element;
  // TODO: Remove optional when we have table components for all tabs
  TableComponent?: (props) => JSX.Element;
  FooterComponent?: () => JSX.Element;
};
