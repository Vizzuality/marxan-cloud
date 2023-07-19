import { AxiosRequestConfig } from 'axios';

import { Response } from 'types/api-model';

// useProjects
export interface UseProjectsOptionsProps {
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>;
}
export type UseProjectsResponse = Response;

// useProject
export interface UseProjectProps {
  adminAreaLevel1Id?: string;
  adminAreaLevel2Id?: string;
  bbox: number[];
  countryId?: string;
  createdAt: string;
  customProtectedAreas: Record<string, unknown>[];
  description: string;
  id: string;
  lastModifiedAt: string;
  metadata: {
    [key: string]: unknown;
  };
  name: string;
  planningAreaId: string;
  planningUnitAreakm2?: number;
  planningUnitGridShape: string;
  publicMetadata: unknown;
  type: string;
}

// useSaveProject
export interface UseSaveProjectProps {
  requestConfig?: AxiosRequestConfig;
}

export interface SaveProjectProps {
  id?: string;
  data: any;
}

export interface UseDeleteProjectProps {
  requestConfig?: AxiosRequestConfig;
}

export interface DeleteProjectProps {
  id: string;
}

export interface UseImportProjectProps {
  requestConfig?: AxiosRequestConfig;
}
export interface ImportProjectProps {
  data: any;
}

// useUploadProjectPA
export interface UseUploadProjectPAProps {
  requestConfig?: AxiosRequestConfig;
}
export interface UploadProjectPAProps {
  id?: string;
  data: any;
}

// useUploadProjectPAGrid

export interface UseUploadProjectPAGridProps {
  requestConfig?: AxiosRequestConfig;
}
export interface UploadProjectPAGridProps {
  data: any;
}

// useDuplicateProject
export interface UseDuplicateProjectProps {
  requestConfig?: AxiosRequestConfig;
}

export interface DuplicateProjectProps {
  id: string | string[];
  data: {
    scenarioIds: string[];
  };
}

// usePublishProject
export interface UsePublishProjectProps {
  requestConfig?: AxiosRequestConfig;
}

export interface PublishProjectProps {
  pid: string | string[];
  data: {
    name: string;
    description: string;
    creators?: Record<string, any>[];
    resources?: Record<string, any>[];
    company?: Record<string, any>;
  };
}

// useUnPublishProject
export interface UseUnPublishProjectProps {
  requestConfig?: AxiosRequestConfig;
}

export interface UnPublishProjectProps {
  id: string | string[];
}

// UseExportProjectProps,
export interface UseExportProjectProps {
  requestConfig?: AxiosRequestConfig;
}

export interface ExportProjectProps {
  id: string | string[];
  data: unknown;
}

// UseDownloadExportProps,
export interface UseDownloadExportProps {
  requestConfig?: AxiosRequestConfig;
}

export interface DownloadExportProps {
  pid: string;
  exportId: string;
}

// useSaveLegacyProject
export interface UseSaveLegacyProjectProps {
  requestConfig?: AxiosRequestConfig;
}

export interface SaveLegacyProjectProps {
  data: {
    projectName: string;
    description: string;
  };
}

// useCancelImportLegacyProject
export interface UseCancelImportLegacyProjectProps {
  requestConfig?: AxiosRequestConfig;
}

export interface CancelImportLegacyProjectProps {
  projectId: string;
}

// useUploadLegacyProjectFile
export interface UseUploadLegacyProjectFileProps {
  requestConfig?: AxiosRequestConfig;
}

export interface UploadLegacyProjectFileProps {
  projectId: string;
  data: unknown;
}

// useImportLegacyProject
export interface UseImportLegacyProjectProps {
  requestConfig?: AxiosRequestConfig;
}

export interface ImportLegacyProjectProps {
  projectId: string;
  data: unknown;
}

// useCancelUploadLegacyProjectFile
export interface UseCancelUploadLegacyProjectFileProps {
  requestConfig?: AxiosRequestConfig;
}

export interface CancelUploadLegacyProjectFileProps {
  projectId: string;
  dataFileId: string;
}

// UseLegacyProjectValidationResults
export interface UseLegacyProjectValidationResultsProps {
  requestConfig?: AxiosRequestConfig;
}

export interface LegacyProjectValidationResultsProps {
  projectId: string;
}
