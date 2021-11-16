import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventBus } from '@nestjs/cqrs';
import { Either, right } from 'fp-ts/Either';

import { ProjectSnapshot } from '@marxan/projects';

import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

import { SelectionGetService } from '../selection-get.service';
import { SelectProtectedArea } from '../select-protected-area';
import { ProtectedAreaKind } from '../protected-area.kind';
import { ProtectedAreaUnlinked } from '../protected-area-unlinked';
import { SelectionChangedEvent } from '@marxan-api/modules/scenarios/protected-area/selection/selection-changed.event';

export const invalidProtectedAreaId = Symbol(`invalid protected area id`);
export type ChangeProtectedAreasError = typeof invalidProtectedAreaId;

@Injectable()
export class SelectionUpdateService {
  constructor(
    private readonly selectionGetService: SelectionGetService,
    @InjectRepository(Scenario)
    protected readonly scenarios: Repository<Scenario>,
    private readonly events: EventBus,
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

    for (const currentAreaState of currentSelection) {
      const entry = newSelection.find(
        (item) => item.id === currentAreaState.id,
      );

      if (!entry) {
        if (currentAreaState.selected) {
          idsToRemove.push(currentAreaState.id);

          if (currentAreaState.kind === ProtectedAreaKind.Project) {
            projectScopedIdsRemoved.push(currentAreaState.id);
          }
        }
        continue;
      }

      if (currentAreaState.kind === ProtectedAreaKind.Global) {
        const relatedAreas = areas[entry.id];

        if (entry.selected) {
          idsToAdd.push(...relatedAreas);
        } else {
          idsToRemove.push(...relatedAreas);
        }
      }

      if (currentAreaState.kind === ProtectedAreaKind.Project) {
        if (entry.selected) {
          idsToAdd.push(entry.id);
        } else {
          idsToRemove.push(entry.id);
          projectScopedIdsRemoved.push(entry.id);
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
      this.events.publish(
        new SelectionChangedEvent(scenario.id, scenario.threshold, idsToAdd),
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
