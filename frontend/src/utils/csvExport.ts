export interface AccountingReportRow {
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

  const rows = data.map(row => [
    escapeCSVField(row.user_name),
    escapeCSVField(row.email),
    escapeCSVField(row.section_name),
    row.opening_balance.toFixed(2),
    row.total_credits.toFixed(2),
    row.total_debits.toFixed(2),
    row.closing_balance.toFixed(2),
    row.debt.toFixed(2)
  ])

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
}

function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

export function downloadCSV(content: string, filename: string): void {
  // Add BOM for proper UTF-8 encoding in Excel
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
