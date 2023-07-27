import { Session } from 'next-auth';

import { Feature } from 'types/feature';
import { Project } from 'types/project-model';

import PROJECTS from 'services/projects';

export function bulkDeleteFeatureFromProject(
  pid: Project['id'],
  fids: Feature['id'][],
  session: Session
) {
  const deleteFeatureFromProject = ({ pid, fid }: { pid: Project['id']; fid: Feature['id'] }) => {
    return PROJECTS.delete(`/${pid}/features/${fid}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  };

  return Promise.all(fids.map((fid) => deleteFeatureFromProject({ pid, fid })));
}

export function editFeaturesTagsBulk(
  projectId: Project['id'],
  featureIds: Feature['id'][],
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
    featureId: Feature['id'];
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
