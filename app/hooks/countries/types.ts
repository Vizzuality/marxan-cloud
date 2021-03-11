import { Response } from 'types/api-model';
import { Country, Region, RegionLevel } from 'types/country-model';

export interface UseCountriesProps {
  includeAll?: boolean;
}

export interface UseCountryRegionsProps {
  id: string;
  includeAll?: boolean;
  level: RegionLevel;
}

export interface UseCountriesResponse extends Response {
  data: Country[];
}

export interface UseCountryRegionsResponse extends Response {
  data: Region[];
}
