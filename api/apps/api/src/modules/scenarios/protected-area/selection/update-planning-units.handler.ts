import {
  CommandBus,
  CommandHandler,
  IInferredCommandHandler,
} from '@nestjs/cqrs';

import { ScenarioPlanningUnitsProtectedStatusCalculatorService } from '@marxan/scenarios-planning-unit';
import { CalculatePlanningUnitsProtectionLevel } from '@marxan-api/modules/planning-units-protection-level';

import { UpdatePlanningUnitsCommand } from './update-planning-units.command';

@CommandHandler(UpdatePlanningUnitsCommand)
export class UpdatePlanningUnitsHandler
  implements IInferredCommandHandler<UpdatePlanningUnitsCommand> {
  constructor(
    private readonly commands: CommandBus,
    private readonly planningUnitsStatusCalculatorService: ScenarioPlanningUnitsProtectedStatusCalculatorService,
  ) {}

  async execute(command: UpdatePlanningUnitsCommand): Promise<void> {
    await this.planningUnitsStatusCalculatorService.calculatedProtectionStatusForPlanningUnitsIn(
      {
        id: command.scenarioId,
        threshold: command.threshold,
      },
    );
    await this.commands.execute(
      new CalculatePlanningUnitsProtectionLevel(
        command.scenarioId,
        command.protectedAreasIds,
      ),
    );
  }
}
