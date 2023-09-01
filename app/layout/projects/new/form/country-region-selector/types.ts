import { MouseEvent } from 'react';

import { Country, Region, SubRegion } from 'types/api/location';

export default interface CountryRegionSelectorProps {
  country?: Country['id'];
  region?: Region['id'];
  subRegion?: SubRegion['id'];
  onClick?: (evt: MouseEvent<HTMLDivElement>) => void;
}
