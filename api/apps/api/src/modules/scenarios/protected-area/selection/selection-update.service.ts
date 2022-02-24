import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventBus } from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';

import { ProjectSnapshot } from '@marxan/projects';

import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';

import { SelectionGetService } from '../getter/selection-get.service';
import { SelectProtectedArea } from '../select-protected-area';
import { ProtectedAreaKind } from '../protected-area.kind';
import { ProtectedAreaUnlinked } from '../protected-area-unlinked';
import { SelectionChangedEvent } from './selection-changed.event';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from '@marxan-api/modules/api-events';

export const invalidProtectedAreaId = Symbol(`invalid protected area id`);
export type ChangeProtectedAreasError = typeof invalidProtectedAreaId;

@Injectable()
export class SelectionUpdateService {
  constructor(
    private readonly selectionGetService: SelectionGetService,
    @InjectRepository(Scenario)
    protected readonly scenarios: Repository<Scenario>,
    private readonly events: EventBus,
    private readonly apiEvents: ApiEventsService,
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
      /**
       * We did originally fire the event below in
       * `CalculatePlanningUnitsProtectionLevelHandler.execute()`, however this
       * would be *after* some potentially expensive SQL queries had been run in
       * `ScenarioPlanningUnitsProtectedStatusCalculatorService.calculatedProtectionStatusForPlanningUnitsIn()`,
       * which would lead is some cases to a very long delay between the time an
       * API user submits a request for `POST
       * /api/scenarios/:id/protected-areas` and the time a
       * `scenario.planningAreaProtectedCalculation.submitted/v1/alpha` event
       * shows up in the scenario status data.
       *
       * However, as we're moving the firing of this event across a couple of
       * cqrs event boundaries, I am less confident that we would consistently
       * fire a `finished` or `failed` event paired with this `submitted` one in
       * case of any unexpected errors. So, long story short, if something
       * starts breaking horribly in how we deal with these
       * `planningAreaProtectedCalculation` events, we should reassess this:
       * probably keeping the event firing here, but adding more appropriately
       * robust error handling, if needed.
       */
      try {
        await this.apiEvents.create({
          kind:
            API_EVENT_KINDS.scenario__planningAreaProtectedCalculation__submitted__v1__alpha1,
          topic: scenario.id,
        });
      } catch (error: unknown) {
        return left(invalidProtectedAreaId);
      }

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
