import { writeFileSync } from 'fs';

type Cell = string | number | boolean | null;

const cell = (v: Cell): string => `"${String(v ?? '').replace(/"/g, '""')}"`;

/**
 * Write a quoted CSV (header + rows). Used to emit the dry-run manifests the
 * client signs off on before any production deletion.
 */
export function writeCsv(
  path: string,
  header: string[],
  rows: Array<Cell[]>,
): void {
  const lines = [
    header.map(cell).join(','),
    ...rows.map((r) => r.map(cell).join(',')),
  ];
  writeFileSync(path, lines.join('\n') + '\n');
}
