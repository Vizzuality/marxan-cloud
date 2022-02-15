export interface ProjectMetadataContent {
  name: string;
  description?: string;
}

export interface ProjectMetadataRelativePathsType {
  projectMetadata: string;
}

export const ProjectMetadataRelativePaths: ProjectMetadataRelativePathsType = {
  projectMetadata: `project-metadata.json`,
};
