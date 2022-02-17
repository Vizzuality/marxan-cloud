export enum ResourceKind {
  Project = 'project',
  Scenario = 'scenario',
}

export function checkIsResourceKind(value: any): value is ResourceKind {
  return Object.values(ResourceKind).includes(value);
}
