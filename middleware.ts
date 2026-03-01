import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Firebase uses client-side auth, so middleware is simpler
// We just need to handle route protection on the server side
export async function middleware(request: NextRequest) {
  // Allow all requests to pass through
  // Firebase handles authentication on the client side
  // Protected routes will check auth state in the component
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
