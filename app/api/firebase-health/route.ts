import { NextResponse } from 'next/server'
import { app, auth, db } from '@/lib/firebase/config'

export async function GET() {
  try {
    // Basic checks
    const projectId = (app.options as any)?.projectId || null
    const appName = app.name

    // Touch auth and db to ensure instances can be resolved
    const authReady = !!auth?.app?.name
    const dbReady = !!(db as any)?._databaseId

    // Optional: attempt a no-op read to validate Firestore connectivity
    // We avoid throwing on permission errors and only treat transport errors as failures
    let firestoreConnectivity: 'ok' | 'permission-denied' | 'error' = 'ok'
    try {
      // Import lazily to avoid bundling overhead in edge runtimes
      const { doc, getDoc } = await import('firebase/firestore')
      const testRef = doc(db, '__health__', 'connectivity')
      await getDoc(testRef)
      firestoreConnectivity = 'ok'
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        firestoreConnectivity = 'permission-denied'
      } else {
        firestoreConnectivity = 'error'
      }
    }

    return NextResponse.json({
      ok: true,
      projectId,
      appName,
      authReady,
      dbReady,
      firestoreConnectivity,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unknown error while checking Firebase',
      },
      { status: 500 }
    )
  }
}


