export interface Project {
  name: String;
  description: String;
  hasCustomArea: boolean;
}

export enum PlanningUnit {
  SQUARE = 'square',
  HEXAGON = 'hexagon',
  UPLOAD = 'upload',
}
