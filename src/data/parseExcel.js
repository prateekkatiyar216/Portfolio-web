import * as XLSX from 'xlsx'

/**
 * Step 1 of the data pipeline: Excel workbook -> plain rows.
 *
 * Returns `{ [sheetName]: Array<Record<header, value>> }` with:
 *  - headers trimmed
 *  - fully empty rows dropped
 *  - cell hyperlinks preserved (a cell whose display text differs from its
 *    link target resolves to the target URL)
 *
 * Works on a Buffer (Node) or ArrayBuffer (browser), so the same parser
 * could run client-side if ever needed.
 */
export function parseExcel(input) {
  const workbook = XLSX.read(input, { type: input instanceof ArrayBuffer ? 'array' : 'buffer', cellDates: true })
  const sheets = {}

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet || !sheet['!ref']) {
      sheets[sheetName] = []
      continue
    }

    const range = XLSX.utils.decode_range(sheet['!ref'])
    const headers = []
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c })]
      headers[c] = cell ? String(cell.v ?? '').trim() : ''
    }

    const rows = []
    for (let r = range.s.r + 1; r <= range.e.r; r++) {
      const row = {}
      let hasValue = false
      for (let c = range.s.c; c <= range.e.c; c++) {
        const header = headers[c]
        if (!header) continue
        const cell = sheet[XLSX.utils.encode_cell({ r, c })]
        if (!cell) continue
        const link = cell.l?.Target
        const value = link && /^https?:/i.test(link) ? link : cell.v
        if (value === undefined || value === null || value === '') continue
        row[header] = value
        hasValue = true
      }
      if (hasValue) rows.push(row)
    }
    sheets[sheetName] = rows
  }

  return sheets
}
