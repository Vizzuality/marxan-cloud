import { OptionalKeys } from 'utility-types';
import { ScenarioFeaturesData } from '@marxan/features';
import { isDefined } from '@marxan/utils';

type SpecDataEntry = {
  id: string;
  target: string;
  prop: string;
  spf?: string;
  target2?: string;
  targetocc?: string;
  name?: string;
  sepnum?: string;
  sepdistance?: string;
};

export class SpecDataTsvFile {
  readonly #requiredColumns = ['id', 'target', 'prop', 'spf'] as const;

  #optionalColumns = new Set<OptionalKeys<SpecDataEntry>>([
    'target2',
    'targetocc',
    'name',
    'sepnum',
    'sepdistance',
  ]);

  #rows: SpecDataEntry[] = [];

  addRow(data: ScenarioFeaturesData) {
    let sepdistance: string | undefined;
    if (typeof data.metadata?.sepdistance === 'number')
      sepdistance = data.metadata.sepdistance.toFixed(2);
    else if (data.metadata?.sepdistance === 'string')
      sepdistance = data.metadata?.sepdistance;

    const entry: SpecDataEntry = {
      id: data.featureId.toString(),
      target: (data.target ?? 0).toFixed(2),
      prop: (data.prop ?? 0).toFixed(2),
      spf: data.fpf?.toFixed(2),
      target2: data.target2?.toFixed(2),
      targetocc: data.targetocc?.toFixed(2),
      name: data.name ?? undefined,
      sepnum: data.sepNum?.toFixed(2),
      sepdistance: sepdistance,
    };

    for (const optionalColumn of this.#optionalColumns) {
      if (!isDefined(entry[optionalColumn]))
        this.#optionalColumns.delete(optionalColumn);
    }

    this.#rows.push(entry);
  }

  toString() {
    const targetColumns = [...this.#requiredColumns, ...this.#optionalColumns];
    const tsvRows = this.#rows.map((row) =>
      targetColumns.map((column) => row[column]).join('\t'),
    );
    return [targetColumns.join('\t'), ...tsvRows].join('\n');
  }
}
