import Link from 'next/link'
import type { ProjectItem } from '@/data/catalog'
import { ArrowUpRightIcon, BuildingIcon, MapPinIcon } from '@/components/ui/icons'

export function ProjectCard({ project }: { project: ProjectItem }) {
  const href = `/projects/${project.slug}`

  return (
    <article className="ll-card">
      <Link href={href} className="ll-card-media" tabIndex={-1} aria-hidden="true">
        <img src={project.heroImage} alt="" loading="lazy" />
        <span className="ll-card-media-shade" />
        <div className="ll-card-badges">
          <span className="ll-chip ll-chip-teal">{project.status}</span>
          <span className="ll-chip ll-chip-glass">{project.developer}</span>
        </div>
        <div className="ll-card-media-foot">
          <MapPinIcon size={14} />
          <span>{project.community}</span>
        </div>
      </Link>

      <div className="ll-card-body">
        <div className="ll-card-kicker">
          <span>{project.segment === 'MIXED-USE' ? 'Mixed-Use' : project.segment === 'COMMERCIAL' ? 'Commercial' : 'Residential'}</span>
        </div>

        <h3 className="ll-card-title">
          <Link href={href}>{project.title}</Link>
        </h3>
        <p className="ll-card-sub">{project.unitTypes}</p>

        <div className="ll-card-price tabular-nums">{project.startingPriceLabel}</div>

        <dl className="ll-card-facts">
          <div className="ll-card-fact">
            <dt>Handover</dt>
            <dd>{project.handoverLabel}</dd>
          </div>
          <div className="ll-card-fact">
            <dt>
              <BuildingIcon size={13} />
              Payment Plan
            </dt>
            <dd>{project.paymentPlan}</dd>
          </div>
        </dl>

        <div className="ll-card-foot">
          <span className="ll-card-ref">{project.refCode}</span>
          <Link href={href} className="ll-card-cta">
            <span>Explore Development</span>
            <span className="ll-card-cta-icon" aria-hidden="true">
              <ArrowUpRightIcon size={14} />
            </span>
          </Link>
        </div>
      </div>
    </article>
  )
}
