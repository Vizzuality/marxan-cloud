import { writeFileSync, mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { readEmailList } from './email-list';

describe('readEmailList', () => {
  const write = (contents: string): string => {
    const f = join(mkdtempSync(join(tmpdir(), 'emails-')), 'e.txt');
    writeFileSync(f, contents);
    return f;
  };

  it('normalizes case, trims, drops blanks, de-duplicates', () => {
    const f = write('A@x.com\n a@x.com \n\nB@y.com\n');
    expect(readEmailList(f)).toEqual(['a@x.com', 'b@y.com']);
  });
});
