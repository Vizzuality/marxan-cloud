import { Session } from 'next-auth';

import { Project, ProjectFeature } from 'types/project-model';

import PROJECTS from 'services/projects';

export function deleteProjectFeatureBulk(
  pid: Project['id'],
  fids: ProjectFeature['id'][],
  session: Session
) {
  const deleteProjectFeature = ({
    pid,
    fid,
  }: {
    pid: Project['id'];
    fid: ProjectFeature['id'];
  }) => {
    return PROJECTS.delete(`/${pid}/features/${fid}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  };

  return Promise.all(fids.map((fid) => deleteProjectFeature({ pid, fid })));
}
