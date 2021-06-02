// TODO debt: move job input & queue name to shared lib
export interface CostSurfaceJobInput {
  scenarioId: string;
  shapefile: Express.Multer.File;
}
