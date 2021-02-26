import { Response } from 'types/api-model';
import { Country } from 'types/country-model';

export interface UseCountriesProps {
  includeAll?: boolean;
}

export interface UseCountriesResponse extends Response {
  data: Country[];
}
