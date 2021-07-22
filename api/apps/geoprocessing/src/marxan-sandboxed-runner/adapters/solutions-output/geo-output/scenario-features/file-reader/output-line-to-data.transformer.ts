import { Transform } from 'stronger-typed-streams';
import { TransformCallback } from 'stream';
import { FeatureIdToScenarioFeatureData } from '../feature-id-to-scenario-feature-data';
import { ScenarioFeatureData } from '../scenario-feature-data';
import { plainToClass } from 'class-transformer';
import { isDefined } from '@marxan/utils';

export class OutputLineToDataTransformer extends Transform<
  string,
  ScenarioFeatureData
> {
  constructor(private readonly idMap: FeatureIdToScenarioFeatureData) {
    super({
      objectMode: true,
    });
  }

  _transform(
    chunk: string,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    const [
      featureId,
      ,
      target,
      amountHeld,
      _occurrenceTarget,
      occurrencesHeld,
      separationTarget,
      separationAchieved,
      targetMet,
      mpm,
    ] = chunk.split(',');
    const data: ScenarioFeatureData = plainToClass<
      ScenarioFeatureData,
      ScenarioFeatureData
    >(ScenarioFeatureData, {
      amount: isDefined(amountHeld) ? +amountHeld : undefined,
      featureScenarioId: this.idMap[+featureId],
      occurrences: isDefined(occurrencesHeld) ? +occurrencesHeld : undefined,
    });

    callback(null, {});
  }
}

// TODO dto validation + transformer tests
// TODO file reader
