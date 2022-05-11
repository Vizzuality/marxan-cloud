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
export interface UserEmail {
  id: string;
  email: string;
}

export interface PublishedProjectDto {
  name?: string;
  description?: string;
  location?: string;
  creators?: Creator[];
  resources?: Resource[];
  company?: Company;
  pngData?: string;
  exportId?: string;
}

export interface CreatePublishedProjectDto extends PublishedProjectDto {
  id: string;
}
export interface UpdatePublishedProjectDto extends PublishedProjectDto {
  underModeration?: boolean;
}
