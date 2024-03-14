import { useRouter } from 'next/router';

import { useAppSelector } from 'store/hooks';
import { ScenarioEditStateProps } from 'store/slices/scenarios/edit';

import Button from 'components/button';
import Loading from 'components/loading';

export const ActionsSummaryButtons = ({ onCancel }: { onCancel: () => void }) => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const { submittingPU }: { submittingPU: ScenarioEditStateProps['submittingPU'] } = useAppSelector(
    (state) => state[`/scenarios/${sid}/edit`]
  );

  return (
    <div className="relative flex space-x-2">
      <Button theme="secondary" size="s" onClick={onCancel}>
        <span>Cancel</span>
      </Button>

      <Button theme="primary" size="s" type="submit" disabled={submittingPU}>
        <span>Save selection</span>
      </Button>
      <Loading
        visible={submittingPU}
        className="absolute right-0 top-1/2 -translate-y-1/2"
        iconClassName="w-5 h-5 text-white"
      />
    </div>
  );
};

export default ActionsSummaryButtons;
