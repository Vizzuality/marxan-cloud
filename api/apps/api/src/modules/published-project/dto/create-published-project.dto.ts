export interface Resource {
  title: string;
  url: string;
}

export interface Creator {
  displayName: string;
  avatarDataUrl: string;
}

export interface Company {
  name: string;
  logoDataUrl: string;
}

export interface CreatePublishedProjectDto {
  id: string;
  name?: string;
  description?: string;
  location?: string;
  creators?: Creator[];
  resources?: Resource[];
  company?: Company;
  pngData?: string;
  exportId?: string;
}
