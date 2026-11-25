import fs from 'node:fs'
import path from 'node:path'
import { HomeView } from '@/components/home/home-view'
import { OrganizationJsonLd } from '@/components/seo/organization-json-ld'
import { HERO_VIDEO_HEVC_SRC, HERO_VIDEO_SRC } from '@/lib/hero-video'
import { getPublishedContent } from '@/modules/content'
import { listVisibleDevelopers } from '@/modules/developers'
import { listPublishedReviews } from '@/modules/reviews'
import { listPublishedProjects, listPublishedProperties } from '@/modules/listings'

// The client's hero video is git-ignored. On Vercel, static files are served via CDN rather than
// local fs at runtime. Checked once per process.
const hasHeroVideo = Boolean(
  process.env.VERCEL ||
    fs.existsSync(path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', HERO_VIDEO_SRC)),
)
const hasHeroHevcVideo = Boolean(
  !process.env.VERCEL &&
    fs.existsSync(
      path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', HERO_VIDEO_HEVC_SRC),
    ),
)

/** Homepage: published content, listings, projects and developers only (never drafts). */
export default async function HomePage() {
  const [content, settings, properties, projects, developers, publishedReviews] = await Promise.all(
    [
      getPublishedContent('home'),
      getPublishedContent('settings'),
      listPublishedProperties(),
      listPublishedProjects({ featured: true }),
      listVisibleDevelopers(),
      listPublishedReviews(),
    ],
  )
  return (
    <HomeView
      content={content}
      properties={properties}
      projects={projects}
      developers={developers}
      hasHeroVideo={hasHeroVideo}
      hasHeroHevcVideo={hasHeroHevcVideo}
      publishedReviews={publishedReviews}
      jsonLd={<OrganizationJsonLd settings={settings} />}
    />
  )
}
