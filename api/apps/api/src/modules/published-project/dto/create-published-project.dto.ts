export interface Resource {
  title: string;
  url: string;
}

export interface Creator {
  fullName: string;
  avatarUrl: string;
}

export interface CreatePublishedProjectDto {
  id: string;
  name: string;
  description?: string;
  creators?: Creator[];
  resources?: Resource[];
  logo?: string;
}
