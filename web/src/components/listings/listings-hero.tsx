import Link from 'next/link'
import { ResponsiveImg } from '@/components/ui/responsive-img'
import { ChevronRightIcon } from '@/components/ui/icons'

/**
 * Light editorial header of the Buy / Rent pages: dark title with a teal second line (the
 * homepage's language), a Buy / Rent switch, and the brand keyhole as a window onto a photo.
 */
export function ListingsHero({
  mode,
  title,
  accent,
  description,
  image,
}: {
  mode: 'BUY' | 'RENT'
  title: string
  accent: string
  description: string
  /** `/images/*.jpg` path; decorative, hidden on small screens. */
  image: string
}) {
  const current = mode === 'BUY' ? 'Buy' : 'Rent'
  return (
    <section className="ll-lhero" data-mode={mode.toLowerCase()}>
      <div className="ll-container ll-lhero-inner">
        <div className="ll-lhero-copy">
          <nav className="ll-lhero-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRightIcon size={13} />
            <span aria-current="page">{current}</span>
          </nav>
          <h1 className="ll-lhero-title">
            {title}
            <span>{accent}</span>
          </h1>
          <p className="ll-lhero-desc">{description}</p>
          <nav className="ll-lhero-modes" aria-label="Browse properties">
            <span className="ll-lhero-mode-thumb" aria-hidden="true" />
            {(['BUY', 'RENT'] as const).map((m) => (
              <Link
                key={m}
                href={m === 'BUY' ? '/buy' : '/rent'}
                className={`ll-lhero-mode${m === mode ? ' is-active' : ''}`}
                aria-current={m === mode ? 'page' : undefined}
              >
                {m === 'BUY' ? 'Buy' : 'Rent'}
              </Link>
            ))}
          </nav>
        </div>

        {/* The brand keyhole, used as a window onto Dubai. Decorative. */}
        <div className="ll-lhero-visual" aria-hidden="true">
          <span className="ll-lhero-keyhole-line" />
          <div className="ll-lhero-keyhole">
            <ResponsiveImg src={image} sizes="300px" priority />
          </div>
        </div>
      </div>
    </section>
  )
}
