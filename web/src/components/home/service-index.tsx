type ServiceItem = {
  title: string
  desc: string
  tag?: string
  featured?: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Homepage services as an editorial index (D-48): one full-width row per service,
 * number · title · description, separated by hairlines. Simple and quiet on purpose,
 * the way consultancies list their practices; no cards, no motion beyond a hover rule.
 */
export function ServiceIndex({ items }: { items: ServiceItem[] }) {
  return (
    <ol className="ll-si" aria-label="Our services">
      {items.map((item, i) => (
        <li key={`${i}-${item.title}`} className="ll-si-row">
          <span className="ll-si-num tabular-nums" aria-hidden="true">
            {pad(i + 1)}
          </span>
          <h3 className="ll-si-title">
            {item.title}
            {item.featured && item.tag && <span className="ll-si-tag">{item.tag}</span>}
          </h3>
          <p className="ll-si-desc">{item.desc}</p>
        </li>
      ))}
    </ol>
  )
}
