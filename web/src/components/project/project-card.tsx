import Link from 'next/link'
import type { ProjectItem } from '@/data/catalog'
import { ArrowUpRightIcon, BuildingIcon, MapPinIcon } from '@/components/ui/icons'

export function ProjectCard({ project }: { project: ProjectItem }) {
  return (
    <article className="ll-property-card">
      <Link href={`/projects/${project.slug}`} className="ll-property-media">
        <img src={project.heroImage} alt={project.title} />
        <div className="ll-property-media-badges">
          <span className="ll-card-tag ll-card-tag-teal">{project.status}</span>
          <span className="ll-card-tag ll-card-tag-light">{project.developer}</span>
        </div>
      </Link>

      <div className="ll-property-body">
        <div className="ll-property-meta-top">
          <span>{project.refCode}</span>
          <span>Handover {project.handoverLabel}</span>
        </div>

        <div className="ll-property-price tabular-nums">{project.startingPriceLabel}</div>

        <h3 className="ll-property-title">
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>

        <div className="ll-property-location">
          <MapPinIcon size={14} />
          <span>{project.community}</span>
        </div>

        <div className="ll-property-specs">
          <span className="ll-spec-item">
            <BuildingIcon size={15} />
            <span>{project.paymentPlan}</span>
          </span>
        </div>

        <Link href={`/projects/${project.slug}`} className="ll-card-detail-link">
          <span>Explore Development</span>
          <ArrowUpRightIcon size={15} />
        </Link>
      </div>
    </article>
  )
}
