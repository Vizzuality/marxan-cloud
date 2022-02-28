const Types = {
  Owner: 'project_owner',
  Contributor: 'project_contributor',
  Viewer: 'project_viewer',
};

export const ROLES = {
  [Types.Owner]: 'Owner',
  [Types.Contributor]: 'Contributor',
  [Types.Viewer]: 'Viewer',
};

export const ROLE_OPTIONS = [
  {
    label: 'Owner',
    value: 'project_owner',
  },
  {
    label: 'Contributor',
    value: 'project_contributor',
  },
  {
    label: 'Viewer',
    value: 'project_viewer',
  }];
