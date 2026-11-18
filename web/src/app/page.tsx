import fs from 'node:fs'
import path from 'node:path'
import { HomeView } from '@/components/home/home-view'
import { OrganizationJsonLd } from '@/components/seo/organization-json-ld'
import { HERO_VIDEO_SRC } from '@/lib/hero-video'
import { getPublishedContent } from '@/modules/content'
import { listVisibleDevelopers } from '@/modules/developers'
import { listPublishedProjects, listPublishedProperties } from '@/modules/listings'

// The client's hero video is git-ignored (over GitHub's 100 MB limit), so it only exists where it
// was placed with scripts/prepare-hero-original.sh. Checked once per process.
const hasHeroVideo = fs.existsSync(
  path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', HERO_VIDEO_SRC),
)

/** Homepage: published content, listings, projects and developers only (never drafts). */
export default async function HomePage() {
  const [content, settings, properties, projects, developers] = await Promise.all([
    getPublishedContent('home'),
    getPublishedContent('settings'),
    listPublishedProperties(),
    listPublishedProjects({ featured: true }),
    listVisibleDevelopers(),
  ])
  return (
    <HomeView
      content={content}
      properties={properties}
      projects={projects}
      developers={developers}
      hasHeroVideo={hasHeroVideo}
      jsonLd={<OrganizationJsonLd settings={settings} />}
    />
  )
}
