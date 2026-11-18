'use client'

import Link from 'next/link'
import type { ProjectItem, PropertyListing } from '@/data/catalog'
import { PropertyCard } from '@/components/property/property-card'
import { ProjectCard } from '@/components/project/project-card'
import { HeartIcon } from '@/components/ui/icons'
import { useAccount } from './account-provider'

function Empty({ text, links }: { text: string; links: { href: string; label: string }[] }) {
  return (
    <div className="ll-acc-empty">
      <span className="ll-acc-empty-icon" aria-hidden="true">
        <HeartIcon size={22} />
      </span>
      <p>{text}</p>
      <div className="ll-acc-empty-links">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="ll-btn ll-btn-outline">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

/**
 * Saved properties and projects. Filtered by the live saved state, so removing a heart here
 * takes the card away at once (the server already stored it).
 */
export function SavedListings({
  properties,
  projects,
}: {
  properties: PropertyListing[]
  projects: ProjectItem[]
}) {
  const { isSaved } = useAccount()
  const shownProperties = properties.filter((p) => p.id && isSaved(`PROPERTY:${p.id}`))
  const shownProjects = projects.filter((p) => p.id && isSaved(`PROJECT:${p.id}`))

  return (
    <>
      <section
        id="saved-properties"
        className="ll-acc-section"
        aria-labelledby="saved-properties-title"
      >
        <div className="ll-acc-section-head">
          <h2 id="saved-properties-title">Saved properties</h2>
          <span className="ll-acc-count tabular-nums">{shownProperties.length}</span>
        </div>
        {shownProperties.length === 0 ? (
          <Empty
            text="No saved properties yet. Tap the heart on any property to keep it here."
            links={[
              { href: '/buy', label: 'Properties for sale' },
              { href: '/rent', label: 'Properties for rent' },
            ]}
          />
        ) : (
          <div className="ll-cards-grid">
            {shownProperties.map((p) => (
              <PropertyCard key={p.slug} property={p} />
            ))}
          </div>
        )}
      </section>

      <section
        id="saved-projects"
        className="ll-acc-section"
        aria-labelledby="saved-projects-title"
      >
        <div className="ll-acc-section-head">
          <h2 id="saved-projects-title">Saved projects</h2>
          <span className="ll-acc-count tabular-nums">{shownProjects.length}</span>
        </div>
        {shownProjects.length === 0 ? (
          <Empty
            text="No saved projects yet. Tap the heart on a development to follow it here."
            links={[{ href: '/projects', label: 'Browse projects' }]}
          />
        ) : (
          <div className="ll-cards-grid">
            {shownProjects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
