import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function PaymentReturnPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Pobierz OrderID z URL (GET) i przekieruj do payment-success
    const orderId = searchParams.get('OrderID') || searchParams.get('orderId')

    setTimeout(() => {
      if (orderId) {
        // Przekieruj do payment-success z parametrami
        navigate(`/payment-success?${searchParams.toString()}`)
      } else {
        // Brak parametrów - wróć do głównej
        navigate('/')
      }
    }, 1000)
  }, [searchParams, navigate])

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <div style={{
          fontSize: '60px',
          animation: 'spin 2s linear infinite',
          marginBottom: '20px'
        }}>
          🦄
        </div>
        <h1 style={{
          color: '#667eea',
          margin: '0 0 10px 0',
          fontSize: '24px'
        }}>
          Powrót z płatności...
        </h1>
        <p style={{
          color: '#666',
          margin: 0
        }}>
          Przetwarzamy wynik Twojej płatności
        </p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
