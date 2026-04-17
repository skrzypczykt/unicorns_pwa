import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

export const useMainWhatsAppChannel = () => {
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMainWhatsAppUrl()
  }, [])

  const fetchMainWhatsAppUrl = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'whatsapp_main_channel_url')
        .maybeSingle()

      if (error) throw error

      if (data?.value && data.value !== 'https://chat.whatsapp.com/EXAMPLE') {
        setWhatsappUrl(data.value)
      }
    } catch (error) {
      console.error('Error fetching WhatsApp URL:', error)
    } finally {
      setLoading(false)
    }
  }

  return { whatsappUrl, loading }
}
