import { IsUUID } from 'class-validator';

export class AddProtectedAreaOutput {
  @IsUUID('all', {
    each: true,
  })
  protectedAreaId!: string[];

  @IsUUID()
  projectId!: string;

  @IsUUID()
  scenarioId!: string;
}
