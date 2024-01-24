export interface Location {
  id: string;
  gid0: string;
  name0: string;
  minPuAreaSize: number;
  maxPuAreaSize: number;
  bbox: [number, number, number, number];
}

export type Country = Location;

export interface Region extends Location {
  gid1: string;
  name1: string;
}

export interface SubRegion extends Location, Region {
  gid2: string;
  name2: string;
}

export type RegionLevel = 1 | 2;
