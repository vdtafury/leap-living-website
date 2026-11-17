import { NextResponse } from 'next/server'
import { ensureSchema, prisma } from '@/server/db'

// Always run (never cached at build time): it reports the live database.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await ensureSchema()
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json(
      { status: 'ok', db: 'up', time: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    // Details go to the server log only: error text can reveal paths and config.
    console.error('[health] database check failed', error)
    return NextResponse.json(
      { status: 'error', db: 'down' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
