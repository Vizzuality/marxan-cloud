export interface Country {
  name: string;
  id: string;
}

export interface Region {
  name: string;
  id: string;
  level: RegionLevel;
}

export enum RegionLevel {
  ONE = 1,
  TWO = 2,
}
