import { ClonePiece } from '../../domain/clone-piece';
import {
  ExportConfigRelativePaths,
  ExportConfigRelativePathsType,
} from './export-config';
import {
  PlanningAreaCustomRelativePaths,
  PlanningAreaCustomRelativePathsType,
} from './planning-area-custom';
import {
  PlanningAreaGadmRelativePaths,
  PlanningAreaGadmRelativePathsType,
} from './planning-area-gadm';
import {
  PlanningAreaCustomGridRelativePaths,
  PlanningAreaCustomGridRelativePathsType,
} from './planning-area-grid-custom';
import {
  ProjectMetadataRelativePaths,
  ProjectMetadataRelativePathsType,
} from './project-metadata';
import {
  ScenarioMetadataRelativePaths,
  ScenarioMetadataRelativePathsType,
} from './scenario-metadata';

interface ClonePieceRelativePathsType {
  [ClonePiece.ExportConfig]: ExportConfigRelativePathsType;
  [ClonePiece.PlanningAreaGAdm]: PlanningAreaGadmRelativePathsType;
  [ClonePiece.PlanningAreaCustom]: PlanningAreaCustomRelativePathsType;
  [ClonePiece.PlanningAreaGridCustom]: PlanningAreaCustomGridRelativePathsType;
  [ClonePiece.ProjectMetadata]: ProjectMetadataRelativePathsType;
  [ClonePiece.ScenarioMetadata]: ScenarioMetadataRelativePathsType;
}

type ClonePieceRelativePaths = {
  [property in ClonePiece]: ClonePieceRelativePathsType[property];
};

export const ClonePieceRelativePaths: ClonePieceRelativePaths = {
  [ClonePiece.ExportConfig]: ExportConfigRelativePaths,
  [ClonePiece.PlanningAreaGAdm]: PlanningAreaGadmRelativePaths,
  [ClonePiece.PlanningAreaCustom]: PlanningAreaCustomRelativePaths,
  [ClonePiece.PlanningAreaGridCustom]: PlanningAreaCustomGridRelativePaths,
  [ClonePiece.ProjectMetadata]: ProjectMetadataRelativePaths,
  [ClonePiece.ScenarioMetadata]: ScenarioMetadataRelativePaths,
};
