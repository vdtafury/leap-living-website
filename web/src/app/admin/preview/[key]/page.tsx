import fs from 'node:fs'
import path from 'node:path'
import { notFound } from 'next/navigation'
import { requireActor } from '@/server/auth/current'
import { HomeView } from '@/components/home/home-view'
import { AboutView } from '@/components/about/about-view'
import { HERO_VIDEO_SRC } from '@/lib/hero-video'
import { getDraftContent } from '@/modules/content'
import { listVisibleDevelopers } from '@/modules/developers'
import { listPublishedReviews } from '@/modules/reviews'
import { listPublishedProjects, listPublishedProperties } from '@/modules/listings'

export const metadata = { title: 'Preview', robots: { index: false, follow: false } }

/**
 * Draft preview: the real page markup filled with the DRAFT content. Signed-in users with
 * `content.view` only; never linked from the public site, never indexed.
 */
export default async function PreviewPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const actor = await requireActor('content.view')
  const banner = (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: '#185C5E',
        color: '#fff',
        padding: '0.55rem 1rem',
        borderRadius: 999,
        fontSize: '0.8rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      }}
    >
      Draft preview: not published
    </div>
  )

  if (key === 'home') {
    const [content, properties, projects, developers, publishedReviews] = await Promise.all([
      getDraftContent(actor, 'home'),
      listPublishedProperties(),
      listPublishedProjects({ featured: true }),
      listVisibleDevelopers(),
      listPublishedReviews(),
    ])
    const hasHeroVideo = Boolean(
      process.env.VERCEL ||
        fs.existsSync(
          path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', HERO_VIDEO_SRC),
        ),
    )
    return (
      <>
        <HomeView
          content={content}
          properties={properties}
          projects={projects}
          developers={developers}
          hasHeroVideo={hasHeroVideo}
          publishedReviews={publishedReviews}
        />
        {banner}
      </>
    )
  }
  if (key === 'about') {
    const [content, developers] = await Promise.all([
      getDraftContent(actor, 'about'),
      listVisibleDevelopers(),
    ])
    return (
      <>
        <AboutView content={content} developers={developers} />
        {banner}
      </>
    )
  }
  notFound()
}
