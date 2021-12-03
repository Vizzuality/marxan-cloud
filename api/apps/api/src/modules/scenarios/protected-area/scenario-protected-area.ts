import { IsBoolean } from 'class-validator';
import { ProtectedArea } from './protected-area';

export class ScenarioProtectedArea extends ProtectedArea {
  @IsBoolean()
  selected!: boolean;
}
