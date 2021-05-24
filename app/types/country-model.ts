export interface Country {
  name: string;
  id: string;
  bbox: number[];
}

export interface Region {
  name: string;
  id: string;
  level: RegionLevel;
  bbox: number[];
}

export enum RegionLevel {
  ONE = 1,
  TWO = 2,
}
