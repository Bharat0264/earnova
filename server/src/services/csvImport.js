const MAX_ROWS = 5000

export const CSV_IMPORT_TYPES = {
  customers: {
    required: ['name'],
    columns: ['name', 'email', 'phone', 'company', 'address', 'notes'],
  },
  products: {
    required: ['sku', 'name', 'sellingPrice'],
    columns: ['sku', 'name', 'category', 'purchasePrice', 'sellingPrice', 'currentQuantity', 'reorderLevel', 'supplier'],
  },
  inventory: {
    required: ['sku', 'name', 'sellingPrice'],
    columns: ['sku', 'name', 'category', 'purchasePrice', 'sellingPrice', 'currentQuantity', 'reorderLevel', 'supplier'],
  },
  expenses: {
    required: ['category', 'amount', 'date'],
    columns: ['category', 'amount', 'vendor', 'date', 'paymentMethod', 'notes', 'recurring'],
  },
  sales: {
    required: ['productSku', 'quantity', 'date'],
    columns: ['productSku', 'quantity', 'customerEmail', 'discount', 'taxRate', 'paymentStatus', 'paymentMethod', 'date'],
  },
}

const normalizeHeader = value => String(value || '').replace(/^\uFEFF/, '').trim()

export const parseCsv = source => {
  const rows = []
  let row = []
  let value = ''
  let quoted = false
  const input = String(source || '')

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    if (char === '"') {
      if (quoted && input[index + 1] === '"') {
        value += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      row.push(value.trim())
      value = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[index + 1] === '\n') index += 1
      row.push(value.trim())
      if (row.some(cell => cell !== '')) rows.push(row)
      row = []
      value = ''
    } else {
      value += char
    }
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted value.')
  row.push(value.trim())
  if (row.some(cell => cell !== '')) rows.push(row)
  if (rows.length < 2) throw new Error('CSV must include a header and at least one data row.')
  if (rows.length - 1 > MAX_ROWS) throw new Error(`CSV cannot contain more than ${MAX_ROWS} data rows.`)

  const headers = rows[0].map(normalizeHeader)
  if (new Set(headers).size !== headers.length) throw new Error('CSV header names must be unique.')
  const records = rows.slice(1).map((cells, rowIndex) => ({
    rowNumber: rowIndex + 2,
    values: Object.fromEntries(headers.map((header, columnIndex) => [header, cells[columnIndex] || ''])),
  }))
  return { headers, records }
}

export const validateCsvShape = (type, parsed) => {
  const config = CSV_IMPORT_TYPES[type]
  if (!config) throw new Error('Unsupported import type.')
  const missing = config.required.filter(column => !parsed.headers.includes(column))
  if (missing.length) throw new Error(`Missing required column(s): ${missing.join(', ')}.`)
  return {
    type,
    rowCount: parsed.records.length,
    headers: parsed.headers,
    expectedColumns: config.columns,
    preview: parsed.records.slice(0, 5),
  }
}

export const csvTemplate = type => {
  const config = CSV_IMPORT_TYPES[type]
  if (!config) throw new Error('Unsupported import type.')
  return `${config.columns.join(',')}\n`
}
