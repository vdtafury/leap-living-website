import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    const mediaAssetCount = await prisma.mediaAsset.count()
    return NextResponse.json({
      status: 'ok',
      db: 'up',
      mediaAssets: mediaAssetCount,
      time: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        db: 'down',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 503 },
    )
  }
}
