/**
 * Parses a standard CSV string into a 2D string array.
 * Conforms to RFC 4180 (supports quoted commas, escaped quotes "", and multiline cells).
 */
export function parseCsv(csvText: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip LF after CR
      }
      row.push(current);
      result.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  // Push remaining cell/row if any data remains
  if (row.length > 0 || current !== '') {
    row.push(current);
    result.push(row);
  }

  return result;
}
