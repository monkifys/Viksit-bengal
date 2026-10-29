/**
 * RFC 4180 Compliant CSV Export & Import Helper
 * Viksit Bengal Dashboard — বিকশিত বাংলা ড্যাশবোর্ড
 */

/**
 * Escape a cell for CSV formatting
 */
function escapeCsvCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Convert an array of objects into a CSV string
 */
function toCsv(rows, headers) {
  if (!rows || rows.length === 0) return '';
  const headerKeys = headers || Object.keys(rows[0]);
  const headerLine = headerKeys.map(escapeCsvCell).join(',');
  const lines = [headerLine];

  for (const row of rows) {
    const rowLine = headerKeys.map(k => escapeCsvCell(row[k])).join(',');
    lines.push(rowLine);
  }

  return lines.join('\r\n');
}

/**
 * Parse a CSV string into an array of objects
 */
function parseCsv(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = [];
  let currentCell = '';
  let currentRow = [];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentCell.trim());
        lines.push(currentRow);
        currentRow = [];
        currentCell = '';
        i++; // skip \n
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentCell.trim());
        lines.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    lines.push(currentRow);
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map(h => h.trim());
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (row.length === 1 && !row[0]) continue; // skip blank line
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j] !== undefined ? row[j] : '';
    }
    results.push({ rowNumber: i + 1, data: obj, ...obj });
  }

  return results;
}

module.exports = {
  toCsv,
  formatCsv: toCsv,
  parseCsv,
  escapeCsvCell
};
