import { readFileSync, mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { writeCsv } from './manifests';

describe('writeCsv', () => {
  it('writes a quoted CSV with header', () => {
    const f = join(mkdtempSync(join(tmpdir(), 'csv-')), 'm.csv');
    writeCsv(f, ['id', 'name'], [
      ['1', 'a,b'],
      ['2', 'q"x'],
    ]);
    expect(readFileSync(f, 'utf8')).toBe('"id","name"\n"1","a,b"\n"2","q""x"\n');
  });
});
