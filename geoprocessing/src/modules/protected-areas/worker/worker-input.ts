import { Express } from 'express';

export interface ProtectedAreasJobInput {
  projectId: string;
  file: Express.Multer.File;
}
