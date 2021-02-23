export interface Project {
  name: string;
  description: string;
  hasCustomArea: boolean;
}

export enum PlanningUnit {
  SQUARE = 'square',
  HEXAGON = 'hexagon',
  UPLOAD = 'upload',
}
