import { Transform } from 'stronger-typed-streams';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { TransformCallback } from 'stream';
import { isDefined } from '@marxan/utils';

import { FeatureIdToScenarioFeatureData } from '../feature-id-to-scenario-feature-data';
import { ScenarioFeatureRunData } from '../scenario-feature-run-data';

export class OutputLineToDataTransformer extends Transform<
  string,
  ScenarioFeatureRunData
> {
  constructor(private readonly idMap: FeatureIdToScenarioFeatureData) {
    super({
      objectMode: true,
    });
  }

  async _transform(
    chunk: string,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    const [
      runId, //  this isn't originally within file content
      featureId,
      _featureName,
      _target,
      amountHeld,
      _occurrenceTarget,
      occurrencesHeld,
      _separationTarget,
      separationAchieved,
      targetMet,
      mpm,
    ] = chunk.split(',');
    const data: ScenarioFeatureRunData = plainToClass<
      ScenarioFeatureRunData,
      ScenarioFeatureRunData
    >(ScenarioFeatureRunData, {
      amount: isDefined(amountHeld) ? +amountHeld : undefined,
      featureScenarioId: this.idMap[+featureId],
      occurrences: isDefined(occurrencesHeld) ? +occurrencesHeld : undefined,
      mpm: isDefined(mpm) ? +mpm : undefined,
      target: isDefined(targetMet) ? targetMet === `yes` : undefined,
      separation: isDefined(separationAchieved)
        ? +separationAchieved
        : undefined,
      runId: +runId,
    });

    const errors = await validateSync(data);
    if (errors.length > 0) {
      return callback(
        new Error(
          errors
            .map((error) => error.toString() + `=> [${error.value}]`)
            .join('. ') + `. Chunk: ${chunk}`,
        ),
      );
    }

    callback(null, data);
  }
}
