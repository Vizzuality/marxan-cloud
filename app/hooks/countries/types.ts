import { Response } from 'types/api-model';
import { Country, Region } from 'types/country-model';

export interface UseCountriesProps {
  includeAll?: boolean;
}

export interface UseCountryRegionsProps {
  id: string;
  includeAll?: boolean;
}

export interface UseCountriesResponse extends Response {
  data: Country[];
}

export interface UseCountryRegionsResponse extends Response {
  data: Region[];
}
