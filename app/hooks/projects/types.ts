import { AxiosRequestConfig } from 'axios';
import { Response } from 'types/api-model';

// useProjects
export interface UseProjectsOptionsProps {
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>
}
export interface UseProjectsResponse extends Response {

}

// useSaveProject
export interface UseSaveProjectProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveProjectProps {
  id?: string,
  data: any
}

export interface UseDeleteProjectProps {
  requestConfig?: AxiosRequestConfig
}

export interface DeleteProjectProps {
  id: string
}

// useUploadProjectPA
export interface UseUploadProjectPAProps {
  requestConfig?: AxiosRequestConfig
}
export interface UploadProjectPAProps {
  id?: string,
  data: any,
}

// useUploadProjectPAGrid

export interface UseUploadProjectPAGridProps {
  requestConfig?: AxiosRequestConfig
}
export interface UploadProjectPAGridProps {
  data: any,
}

// useDuplicateProject
export interface UseDuplicateProjectProps {
  requestConfig?: AxiosRequestConfig;
}

export interface DuplicateProjectProps {
  id: string | string[];
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
  requestConfig?: AxiosRequestConfig
}

export interface DownloadExportProps {
  pid: string,
  exportId: string
}
