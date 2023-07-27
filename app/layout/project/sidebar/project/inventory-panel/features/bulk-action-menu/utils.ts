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

export function editFeaturesTags(
  projectId: Project['id'],
  featureIds: ProjectFeature['id'][],
  session: Session,
  data: {
    tagName: string;
  }
) {
  const editFeatureTag = ({
    featureId,
    projectId,
    data,
  }: {
    featureId: ProjectFeature['id'];
    projectId: Project['id'];
    data: {
      tagName: string;
    };
  }) => {
    return PROJECTS.request({
      method: 'PATCH',
      url: `/${projectId}/features/${featureId}/tags`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  };
  return Promise.all(featureIds.map((featureId) => editFeatureTag({ projectId, featureId, data })));
}
