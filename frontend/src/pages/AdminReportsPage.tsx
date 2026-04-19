import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import type { AccountingReportRow } from '../utils/csvExport'
import { generateAccountingCSV, downloadCSV } from '../utils/csvExport'

interface ActivityType {
  id: string
  name: string
}

interface AttendanceReportRow {
  user_name: string
  section_name: string
  attended: number
  no_show: number
  total_registrations: number
  attendance_rate: number
}

type ReportType = 'accounting' | 'attendance'

export default function AdminReportsPage() {
  const navigate = useNavigate()
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [reportType, setReportType] = useState<ReportType>('accounting')
  const [reportData, setReportData] = useState<AccountingReportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Clear report data when report type changes
  const handleReportTypeChange = (newType: ReportType) => {
    setReportType(newType)
    setReportData([])  // Clear old data to prevent type mismatch
    setError(null)
  }

  // Generate last 12 months for dropdown
  const generateMonthOptions = () => {
    const months = []
    const today = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const value = date.toISOString().slice(0, 10) // YYYY-MM-DD
      const label = date.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long' })
      months.push({ value, label })
    }
    return months
  }

  const monthOptions = generateMonthOptions()

  // Fetch activity types on mount
  useEffect(() => {
    async function fetchActivityTypes() {
      const { data, error } = await supabase
        .from('activity_types')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Error fetching activity types:', error)
      } else {
        setActivityTypes(data || [])
      }
    }

    fetchActivityTypes()

    // Set default month to current month
    if (monthOptions.length > 0) {
      setSelectedMonth(monthOptions[0].value)
    }
  }, [])

  const handleGenerateReport = async () => {
    if (!selectedMonth) {
      setError('Wybierz miesiąc')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (reportType === 'accounting') {
        // Supabase client will automatically include auth headers
        const response = await supabase.functions.invoke('generate-accounting-report', {
          body: {
            month: selectedMonth,
            activityTypeId: selectedSection || null
          }
        })

        console.log('Edge Function response:', response)

        // Log the raw response for debugging
        if (response.error?.response) {
          const errorResponse = response.error.response
          console.error('Error response status:', errorResponse.status)
          console.error('Error response headers:', errorResponse.headers)

          // Try to read the response body
          try {
            const errorText = await errorResponse.text()
            console.error('Error response body:', errorText)

            try {
              const errorJson = JSON.parse(errorText)
              throw new Error(errorJson.error || errorJson.message || 'Błąd autoryzacji')
            } catch (parseErr) {
              throw new Error(errorText || 'Błąd wywołania funkcji')
            }
          } catch (readErr) {
            console.error('Could not read error response:', readErr)
          }
        }

        if (response.error) {
          console.error('Edge Function error:', response.error)
          throw new Error(response.error.message || 'Błąd wywołania funkcji')
        }

        // Check if data exists and has the expected structure
        if (!response.data) {
          throw new Error('Brak danych w odpowiedzi')
        }

        // The response.data contains the actual response from the function
        const functionData = response.data
        console.log('Function data:', functionData)

        // Check if there's an error in the function response
        if (functionData.error) {
          throw new Error(functionData.error)
        }

        // Check if data exists in the expected structure
        if (!functionData.data) {
          throw new Error('Nieprawidłowa struktura odpowiedzi')
        }

        setReportData(functionData.data || [])
      } else {
        // Attendance report - fetch directly from database
        await generateAttendanceReport()
      }
    } catch (err: any) {
      console.error('Error generating report:', err)
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      })
      setError(err.message || 'Nie udało się wygenerować raportu')
    } finally {
      setLoading(false)
    }
  }

  const generateAttendanceReport = async () => {
    const monthStart = new Date(selectedMonth)
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59)

    let query = supabase
      .from('registrations')
      .select(`
        user:users(display_name),
        activity:activities(
          activity_type:activity_types(name),
          date_time
        ),
        status
      `)
      .gte('activity.date_time', monthStart.toISOString())
      .lte('activity.date_time', monthEnd.toISOString())

    if (selectedSection) {
      query = query.eq('activity.activity_type_id', selectedSection)
    }

    const { data, error } = await query

    if (error) throw error

    // Aggregate attendance data
    const aggregated: Record<string, AttendanceReportRow> = {}

    data?.forEach((reg: any) => {
      // Skip records with missing data
      if (!reg.user || !reg.activity || !reg.activity.activity_type) {
        return
      }

      const key = `${reg.user.display_name}-${reg.activity.activity_type.name}`
      if (!aggregated[key]) {
        aggregated[key] = {
          user_name: reg.user.display_name,
          section_name: reg.activity.activity_type.name,
          attended: 0,
          no_show: 0,
          total_registrations: 0,
          attendance_rate: 0
        }
      }

      aggregated[key].total_registrations++
      if (reg.status === 'attended') aggregated[key].attended++
      if (reg.status === 'no_show') aggregated[key].no_show++
    })

    // Calculate attendance rate
    Object.values(aggregated).forEach(row => {
      row.attendance_rate = row.total_registrations > 0
        ? Math.round((row.attended / row.total_registrations) * 100 * 100) / 100
        : 0
    })

    setReportData(Object.values(aggregated) as any)
  }

  const handleExportCSV = () => {
    if (reportData.length === 0) {
      alert('Brak danych do eksportu')
      return
    }

    const sectionName = selectedSection
      ? activityTypes.find(t => t.id === selectedSection)?.name || 'wszystkie'
      : 'wszystkie'

    const monthFormatted = new Date(selectedMonth).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit'
    }).replace(/\./g, '-')

    const filename = `raport_ksiegowy_${sectionName}_${monthFormatted}.csv`
    const csv = generateAccountingCSV(reportData)
    downloadCSV(csv, filename)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-purple-900">📊 Raporty Księgowe</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden md:flex px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all items-center gap-2"
          >
            ← Powrót do menu
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Month selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Miesiąc
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Section selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sekcja
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Wszystkie sekcje</option>
                {activityTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Report type selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typ raportu
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="accounting"
                    checked={reportType === 'accounting'}
                    onChange={(e) => handleReportTypeChange(e.target.value as ReportType)}
                    className="mr-2"
                  />
                  <span>Księgowy</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="attendance"
                    checked={reportType === 'attendance'}
                    onChange={(e) => handleReportTypeChange(e.target.value as ReportType)}
                    className="mr-2"
                  />
                  <span>Frekwencja</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Generowanie...' : 'Generuj Raport'}
            </button>

            {reportType === 'accounting' && reportData.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
              >
                📥 Eksportuj CSV
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Results table */}
        {reportData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              {reportType === 'accounting' ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Użytkownik
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sekcja
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Saldo pocz.
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wpłaty
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Obciążenia
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Saldo końc.
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zadłużenie
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((row, index) => {
                      // Type guard - check if this is actually accounting data
                      const isAccountingRow = 'opening_balance' in row && 'total_credits' in row
                      if (!isAccountingRow) {
                        console.error('Wrong data type in accounting report:', row)
                        return null
                      }

                      return (
                        <tr
                          key={index}
                          className={row.debt > 0 ? 'bg-red-50' : row.closing_balance > 0 ? 'bg-green-50' : ''}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {row.user_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row.section_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {row.opening_balance?.toFixed(2) ?? '0.00'} zł
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                            +{row.total_credits?.toFixed(2) ?? '0.00'} zł
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                            -{row.total_debits?.toFixed(2) ?? '0.00'} zł
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                            (row.closing_balance ?? 0) < 0 ? 'text-red-700' : (row.closing_balance ?? 0) > 0 ? 'text-green-700' : 'text-gray-900'
                          }`}>
                            {row.closing_balance?.toFixed(2) ?? '0.00'} zł
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-700 font-semibold">
                            {(row.debt ?? 0) > 0 ? `${row.debt?.toFixed(2) ?? '0.00'} zł` : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Użytkownik
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sekcja
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Obecności
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nieobecności
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Razem
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % Frekwencji
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(reportData as unknown as AttendanceReportRow[]).map((row, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.user_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.section_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                          {row.attended}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                          {row.no_show}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {row.total_registrations}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                          {row.attendance_rate.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {!loading && reportData.length === 0 && selectedMonth && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            Brak danych dla wybranego okresu
          </div>
        )}
      </div>
    </div>
  )
}
