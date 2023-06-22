import Button from 'components/button';

export const ActionsSummaryButtons = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <div className="flex space-x-2">
      <Button theme="secondary" size="s" onClick={onCancel}>
        <span>Cancel</span>
      </Button>

      <Button theme="primary" size="s" type="submit">
        <span>Save selection</span>
      </Button>
    </div>
  );
};

export default ActionsSummaryButtons;
