#!/usr/bin/env python3
"""Convert the client's user-deletion xlsx (single 'email' column) into a
normalized, de-duplicated, lowercased newline-delimited text file.

Usage: python3 xlsx_to_emails.py <input.xlsx> <output.txt>
Requires openpyxl (pip install --user openpyxl, or a venv).
"""
import sys
import re

import openpyxl


def main():
    src, dst = sys.argv[1], sys.argv[2]
    wb = openpyxl.load_workbook(src, read_only=True, data_only=True)
    ws = wb.worksheets[0]
    emails, header = [], None
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            header = row
            continue
        v = row[0]
        if v is None or not str(v).strip():
            continue
        emails.append(str(v).strip().lower())
    bad = [e for e in emails if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', e)]
    uniq = sorted(set(emails))
    with open(dst, 'w') as f:
        f.write('\n'.join(uniq) + '\n')
    print(f"header={header} rows={len(emails)} unique={len(uniq)} malformed={len(bad)}")
    for b in bad[:20]:
        print("  MALFORMED:", repr(b))


if __name__ == '__main__':
    main()
