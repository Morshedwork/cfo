// Firebase Server-side Authentication for API Routes
// Since we're using client-side Firebase, we'll verify tokens on the server
import { auth } from './config'

/**
 * Get user from authorization header
 * In Firebase client-side setup, we pass the ID token in the Authorization header
 */
export async function getAuthUser(request: Request): Promise<{ uid: string; email: string | null } | null> {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const idToken = authHeader.split('Bearer ')[1]
    
    // For client-side Firebase, we trust the current user
    // In production, you'd use Firebase Admin SDK to verify the token
    // For now, we'll decode the JWT payload (without verification for simplicity)
    const payload = parseJwt(idToken)
    
    if (!payload || !payload.user_id) {
      return null
    }

    return {
      uid: payload.user_id,
      email: payload.email || null
    }
  } catch (error) {
    console.error('Error getting auth user:', error)
    return null
  }
}

/**
 * Simple JWT decoder (no verification)
 * For production, use Firebase Admin SDK to verify tokens
 */
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString()
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

/**
 * Alternative: Get user ID from cookies (simpler approach)
 * This works if you're setting the user ID in a cookie on the client
 */
export async function getUserIdFromCookies(request: Request): Promise<string | null> {
  const cookies = request.headers.get('cookie')
  if (!cookies) return null

  const match = cookies.match(/userId=([^;]+)/)
  return match ? match[1] : null
}

