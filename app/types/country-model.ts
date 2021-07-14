export interface Country {
  name: string;
  id: string;
  bbox: number[];
  minPuAreaSize: number;
  maxPuAreaSize: number;
}

export interface Region {
  name: string;
  id: string;
  level: RegionLevel;
  bbox: number[];
  minPuAreaSize: number;
  maxPuAreaSize: number;
}

export enum RegionLevel {
  ONE = 1,
  TWO = 2,
}
