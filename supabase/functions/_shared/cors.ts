// Shared CORS configuration for Edge Functions
// Security: Restrict to specific domains instead of '*'

// Production domains - UPDATE THESE when you have custom domain
const ALLOWED_ORIGINS = [
  'http://localhost:5173',  // Local development
  'http://localhost:3000',  // Alternative local port
  'https://*.netlify.app',  // Netlify deployments (all subdomains)
  // Add your custom domain when ready:
  // 'https://unicorns.org.pl',
  // 'https://www.unicorns.org.pl',
]

/**
 * Get CORS headers for a specific origin
 * @param origin - Request origin header
 * @returns CORS headers object
 */
export function getCorsHeaders(origin?: string | null) {
  // Check if origin is allowed
  const isAllowed = origin && ALLOWED_ORIGINS.some(allowedOrigin => {
    // Handle wildcard subdomains
    if (allowedOrigin.includes('*')) {
      const pattern = allowedOrigin.replace('*', '.*')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(origin)
    }
    return allowedOrigin === origin
  })

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin! : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
}

/**
 * Standard CORS headers for responses
 * Use this for backward compatibility with existing code
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be overridden by getCorsHeaders
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
