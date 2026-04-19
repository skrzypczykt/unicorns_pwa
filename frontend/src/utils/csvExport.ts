type AccountingReportRow = {
  user_id: string
  user_name: string
  email: string
  section_name: string
  opening_balance: number
  closing_balance: number
  total_credits: number
  total_debits: number
  classes_attended: number
  classes_total: number
  debt: number
}

export type { AccountingReportRow }

export function generateAccountingCSV(data: AccountingReportRow[]): string {
  const headers = [
    'Użytkownik',
    'Email',
    'Sekcja',
    'Saldo początkowe',
    'Wpłaty',
    'Obciążenia',
    'Saldo końcowe',
    'Zadłużenie'
  ]

  // Use semicolon as delimiter for better Excel compatibility in Polish locale
  const delimiter = ';'

  const rows = data.map(row => [
    escapeCSVField(row.user_name, delimiter),
    escapeCSVField(row.email, delimiter),
    escapeCSVField(row.section_name, delimiter),
    row.opening_balance.toFixed(2).replace('.', ','), // Polish decimal separator
    row.total_credits.toFixed(2).replace('.', ','),
    row.total_debits.toFixed(2).replace('.', ','),
    row.closing_balance.toFixed(2).replace('.', ','),
    row.debt.toFixed(2).replace('.', ',')
  ])

  return [
    headers.join(delimiter),
    ...rows.map(row => row.join(delimiter))
  ].join('\n')
}

function escapeCSVField(field: string, delimiter: string = ','): string {
  if (field.includes(delimiter) || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

export function downloadCSV(content: string, filename: string): void {
  // Add UTF-8 BOM (Byte Order Mark) for proper encoding in Excel
  // BOM: EF BB BF in hex = \uFEFF in Unicode
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + content], {
    type: 'text/csv;charset=utf-8;'
  })

  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
