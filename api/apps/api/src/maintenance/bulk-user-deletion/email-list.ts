import { readFileSync } from 'fs';

/**
 * Read a newline-delimited email list (produced by xlsx_to_emails.py), returning
 * trimmed, lowercased, de-duplicated, blank-stripped emails. Matching against
 * `users.email` is case-insensitive, so normalization happens here once.
 */
export function readEmailList(path: string): string[] {
  const seen = new Set<string>();
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const e = line.trim().toLowerCase();
    if (e) seen.add(e);
  }
  return [...seen];
}
