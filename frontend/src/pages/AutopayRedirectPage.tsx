import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function AutopayRedirectPage() {
  const [searchParams] = useSearchParams()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    // Auto-submit po załadowaniu
    const timer = setTimeout(() => {
      if (formRef.current) {
        formRef.current.submit()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const gatewayUrl = searchParams.get('gatewayUrl') || 'https://testpay.autopay.eu/payment'
  const serviceId = searchParams.get('ServiceID') || ''
  const orderId = searchParams.get('OrderID') || ''
  const amount = searchParams.get('Amount') || ''
  const customerEmail = searchParams.get('CustomerEmail') || ''
  const hash = searchParams.get('Hash') || ''
  const currency = searchParams.get('Currency') || ''
  const description = searchParams.get('Description') || ''

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
          Przekierowanie do płatności...
        </h1>
        <p style={{
          color: '#666',
          margin: 0
        }}>
          Za chwilę zostaniesz przekierowany do bramki płatności Autopay
        </p>
      </div>

      <form ref={formRef} method="POST" action={gatewayUrl} style={{ display: 'none' }}>
        <input type="hidden" name="ServiceID" value={serviceId} />
        <input type="hidden" name="OrderID" value={orderId} />
        <input type="hidden" name="Amount" value={amount} />
        <input type="hidden" name="CustomerEmail" value={customerEmail} />
        <input type="hidden" name="Hash" value={hash} />
        {currency && <input type="hidden" name="Currency" value={currency} />}
        {description && <input type="hidden" name="Description" value={description} />}
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
