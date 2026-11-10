import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ProjectListingBrowser } from '@/components/project/project-listing-browser'
import { ChevronRightIcon } from '@/components/ui/icons'
import { PROJECTS } from '@/data/catalog'

export const metadata: Metadata = {
  title: 'Real Estate Projects in Dubai | LEAP LIVING',
  description:
    'Selected off-plan, master-planned, and flagship Dubai real estate developments curated by Leap Living.',
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ community?: string; type?: string }>
}) {
  const params = await searchParams

  return (
    <>
      <SiteHeader />

      <main>
        <section className="ll-page-hero">
          <div className="ll-container">
            <div className="ll-breadcrumbs">
              <Link href="/">Home</Link>
              <ChevronRightIcon size={13} />
              <span>Projects</span>
            </div>
            <div className="ll-eyebrow">New Developments</div>
            <h1 className="ll-page-hero-title">Featured Real Estate Projects</h1>
            <p className="ll-page-hero-desc">
              Curated primary market developments evaluated on developer track record,
              payment structure, floorplan efficiency, and long-term capital resilience. Select
              any development for complete specifications and milestone schedules.
            </p>
          </div>
        </section>

        <section className="ll-section-muted">
          <div className="ll-container">
            <ProjectListingBrowser
              projects={PROJECTS}
              initialCommunity={params.community ?? 'ALL'}
              initialType={params.type ?? 'ALL'}
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
