import Link from 'next/link'
import type { ComponentType } from 'react'
import { ResponsiveImg } from '@/components/ui/responsive-img'
import { ArrowRightIcon, ArrowUpRightIcon, HandshakeIcon } from '@/components/ui/icons'
import { PlanDirectLines, PlanEstimator } from './plan-estimator'

export interface PlanTool {
  icon: ComponentType<{ size?: number }>
  tag: string
  title: string
}

export interface PlanFeature {
  href: string
  image: string
  imageAlt: string
  title: string
  text: string
  /** Small chip on the photo, e.g. "6 developments" (only real numbers) */
  chip?: string
}

/**
 * Closing section of the Buy / Rent pages (D-58): a bento of three different tiles instead of
 * a link list.
 * - A working estimator (Buy: monthly repayment for a price; Rent: what the rent could buy).
 * - A photo tile to the next page (Buy: new projects; Rent: list your property).
 * - A dark private-consultation tile with WhatsApp and call.
 */
export function ListingsPlan({
  mode,
  title,
  lead,
  tool,
  feature,
  consultText,
}: {
  mode: 'BUY' | 'RENT'
  title: string
  lead: string
  tool: PlanTool
  feature: PlanFeature
  consultText: string
}) {
  return (
    <section className="ll-plan" aria-labelledby="ll-plan-title">
      <div className="ll-container">
        <div className="ll-plan-head">
          <h2 id="ll-plan-title" className="ll-serif-title ll-plan-title">
            {title}
          </h2>
          <p className="ll-plan-lead">{lead}</p>
        </div>

        <div className="ll-plan-bento">
          <PlanEstimator
            mode={mode}
            icon={<tool.icon size={16} />}
            tag={tool.tag}
            title={tool.title}
          />

          <Link href={feature.href} className="ll-plan-feature">
            <ResponsiveImg
              src={feature.image}
              alt={feature.imageAlt}
              sizes="(max-width: 960px) 100vw, 40vw"
              className="ll-plan-feature-img"
            />
            {feature.chip && <span className="ll-plan-chip">{feature.chip}</span>}
            <span className="ll-plan-feature-arrow" aria-hidden="true">
              <ArrowUpRightIcon size={18} />
            </span>
            <span className="ll-plan-feature-body">
              <strong>{feature.title}</strong>
              <span>{feature.text}</span>
            </span>
          </Link>

          <div className="ll-plan-talk">
            <span className="ll-plan-talk-icon" aria-hidden="true">
              <HandshakeIcon size={22} />
            </span>
            <h3 className="ll-plan-talk-title">Private consultation</h3>
            <p className="ll-plan-talk-text">{consultText}</p>
            <div className="ll-plan-talk-actions">
              <Link href="/contact" className="ll-btn ll-plan-talk-cta">
                <span>Book a consultation</span>
                <ArrowRightIcon size={15} />
              </Link>
              <PlanDirectLines mode={mode} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
