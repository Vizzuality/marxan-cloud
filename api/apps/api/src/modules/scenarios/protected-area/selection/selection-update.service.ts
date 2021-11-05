import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';

import { ProjectSnapshot } from '@marxan/projects';

import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { CalculatePlanningUnitsProtectionLevel } from '@marxan-api/modules/planning-units-protection-level';
import { ScenarioPlanningUnitsProtectedStatusCalculatorService } from '@marxan/scenarios-planning-unit';

import { SelectionGetService } from './selection-get.service';
import { SelectProtectedArea } from '../select-protected-area';
import { ProtectedAreaKind } from '../protected-area.kind';
import { ProtectedAreaUnlinked } from '../protected-area-unlinked';

export const invalidProtectedAreaId = Symbol(`invalid protected area id`);
export type ChangeProtectedAreasError = typeof invalidProtectedAreaId;

@Injectable()
export class SelectionUpdateService {
  constructor(
    private readonly selectionGetService: SelectionGetService,
    @InjectRepository(Scenario)
    protected readonly scenarios: Repository<Scenario>,
    private readonly events: EventBus,
    private readonly commands: CommandBus,
    private readonly planningUnitsStatusCalculatorService: ScenarioPlanningUnitsProtectedStatusCalculatorService,
  ) {}

  async selectFor(
    scenario: {
      id: string;
      protectedAreaIds: string[];
      threshold: number;
    },
    project: ProjectSnapshot,
    newSelection: SelectProtectedArea[],
  ): Promise<Either<ChangeProtectedAreasError, true>> {
    const currentSelection = await this.selectionGetService.getFor(
      scenario,
      project,
    );

    const idsToAdd: string[] = [];
    const idsToRemove: string[] = [];
    const projectScopedIdsRemoved: string[] = [];

    // TODO refactor to pieces
    const { areas } = await this.selectionGetService.getGlobalProtectedAreas(
      project,
    );

    for (const change of newSelection) {
      const entry = currentSelection.find((item) => item.id === change.id);
      if (!entry) {
        return left(invalidProtectedAreaId);
      }

      if (entry.kind === ProtectedAreaKind.Global) {
        const relatedAreas = areas[change.id];

        if (change.selected) {
          idsToAdd.push(...relatedAreas);
        } else {
          idsToRemove.push(...relatedAreas);
        }
      }

      if (entry.kind === ProtectedAreaKind.Project) {
        if (change.selected) {
          idsToAdd.push(change.id);
        } else {
          idsToRemove.push(change.id);
          projectScopedIdsRemoved.push(change.id);
        }
      }
    }

    await this.scenarios.update(
      {
        id: scenario.id,
      },
      {
        protectedAreaFilterByIds: idsToAdd,
        wdpaThreshold: scenario.threshold,
      },
    );

    if (idsToAdd.length > 0 || idsToRemove.length > 0) {
      await this.planningUnitsStatusCalculatorService.calculatedProtectionStatusForPlanningUnitsIn(
        {
          id: scenario.id,
          threshold: scenario.threshold,
        },
      );
      await this.commands.execute(
        new CalculatePlanningUnitsProtectionLevel(scenario.id, idsToAdd),
      );
    }

    // let some service to pick up and verify if anyone still uses it, maybe
    // schedule automatic removal
    if (projectScopedIdsRemoved.length > 0) {
      projectScopedIdsRemoved.forEach((id) =>
        this.events.publish(new ProtectedAreaUnlinked(id, project.id)),
      );
    }

    return right(true);
  }
}
