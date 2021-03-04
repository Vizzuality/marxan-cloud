import { Response } from 'types/api-model';
import { Region } from 'types/country-model';

export interface UseAdministrativeAreasProps {
  id: string;
  includeAll?: boolean;
}

export interface UseAdministrativeAreasResponse extends Response {
  data: Region[];
}
