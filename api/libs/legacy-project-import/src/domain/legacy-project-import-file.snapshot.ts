import { LegacyProjectImportFileType } from './legacy-project-import-file-type';

export interface LegacyProjectImportFileSnapshot {
  id: string;
  location: string;
  type: LegacyProjectImportFileType;
}
