import { useCallback, useMemo } from 'react';

import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useSession } from 'next-auth/react';

import { useToasts } from 'hooks/toast';
import { useProjectWDPAs } from 'hooks/wdpa';

import { Button } from 'components/button/component';
import Icon from 'components/icon/component';
import { ModalProps } from 'components/modal';
import { bulkDeleteWDPAFromProject } from 'layout/project/sidebar/project/inventory-panel/wdpas/bulk-action-menu/utils';
import { WDPA } from 'types/api/wdpa';

import ALERT_SVG from 'svgs/ui/new-layout/alert.svg?sprite';

const DeleteModal = ({
  selectedWDPAIds,
  onDismiss,
}: {
  selectedWDPAIds: WDPA['id'][];
  onDismiss?: ModalProps['onDismiss'];
}): JSX.Element => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { query } = useRouter();
  const { pid } = query as { pid: string };
  const { addToast } = useToasts();

  const allProjectWDPAsQuery = useProjectWDPAs(pid, {});

  const selectedWDPAs = useMemo(() => {
    return allProjectWDPAsQuery.data?.filter(({ id }) => selectedWDPAIds.includes(id));
  }, [allProjectWDPAsQuery.data, selectedWDPAIds]);

  const WDPAsNames = selectedWDPAs.map(({ fullName }) => fullName);

  // ? the user will be able to delete the protected areas only if they are not being used by any scenario.
  const haveScenarioAssociated = selectedWDPAs.some(({ scenarioUsageCount }) =>
    Boolean(scenarioUsageCount)
  );

  const handleBulkDelete = useCallback(() => {
    const deletableWDPAsIds = selectedWDPAs.map(({ id }) => id);

    bulkDeleteWDPAFromProject(pid, deletableWDPAsIds, session)
      .then(async () => {
        await queryClient.invalidateQueries(['wdpas', pid]);

        onDismiss();

        addToast(
          'delete-bulk-project-wdpas',
          <>
            <h2 className="font-medium">Success</h2>
            <p className="text-sm">The protected areas were deleted successfully.</p>
          </>,
          {
            level: 'success',
          }
        );
      })
      .catch(() => {
        addToast(
          'delete-bulk-project-wdpas',
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Something went wrong deleting the protected areas</p>
          </>,
          {
            level: 'error',
          }
        );
      });
  }, [selectedWDPAs, addToast, onDismiss, pid, queryClient, session]);

  return (
    <div className="flex flex-col space-y-5 px-8 py-1">
      <h2 className="font-heading font-bold text-black">{`Delete protected area${
        selectedWDPAIds.length > 1 ? 's' : ''
      }`}</h2>
      <p className="font-heading text-sm font-medium text-black">
        {selectedWDPAIds.length > 1 ? (
          <div className="space-y-2">
            <span>
              Are you sure you want to delete the following protected areas? <br />
              This action cannot be undone.
            </span>
            <ul>
              {WDPAsNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        ) : (
          <span>
            Are you sure you want to delete &quot;{WDPAsNames[0]}&quot; protected area? <br />
            This action cannot be undone.
          </span>
        )}
      </p>
      <div className="flex items-center space-x-1.5 rounded border-l-[5px] border-red-700 bg-red-100/50 px-1.5 py-4">
        <Icon className="h-10 w-10 text-red-700" icon={ALERT_SVG} />
        <p className="font-sans text-xs font-medium text-black">
          A protected area can be deleted ONLY if it&apos;s not being used by any scenario
        </p>
      </div>
      <div className="flex w-full justify-between space-x-3 px-10 py-2">
        <Button theme="secondary" size="lg" className="w-full" onClick={onDismiss}>
          Cancel
        </Button>
        <Button
          theme="danger-alt"
          size="lg"
          className="w-full"
          disabled={haveScenarioAssociated}
          onClick={handleBulkDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default DeleteModal;
