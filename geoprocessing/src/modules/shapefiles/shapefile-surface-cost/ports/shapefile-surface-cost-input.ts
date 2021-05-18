import { Express } from 'express';

// breaking rules for brevity; ideally we shouldn't pollute application with Express
export interface ShapefileSurfaceCostInput {
  shapefile: Express.Multer.File;
}
