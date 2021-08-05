import { ICommand } from '@nestjs/cqrs';

export class CalculateFeatures implements ICommand {
  constructor(public readonly featureIds: string[]) {}
}
