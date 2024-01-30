import { Session } from 'next-auth';

import { Project } from 'types/api/project';
import { WDPA } from 'types/api/wdpa';

import { API } from 'services/api';

export function bulkDeleteWDPAFromProject(
  pid: Project['id'],
  wdpaids: WDPA['id'][],
  session: Session
) {
  const deleteFeatureFromProject = ({
    pid,
    wdpaid,
  }: {
    pid: Project['id'];
    wdpaid: WDPA['id'];
  }) => {
    return API.delete(`/protected-areas/${wdpaid}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  };

  return Promise.all(wdpaids.map((wdpaid) => deleteFeatureFromProject({ pid, wdpaid })));
}
