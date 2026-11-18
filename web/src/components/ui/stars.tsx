import { StarIcon } from '@/components/ui/icons'

/**
 * Star rating (D-44). Gold stars on the filled part, light grey on the rest; whole and half
 * stars from the rating (e.g. 4.5 for an average). Screen readers hear "Rated 4.5 out of 5".
 */
export function Stars({
  rating,
  size = 16,
  className = '',
}: {
  rating: number
  size?: number
  className?: string
}) {
  const value = Math.max(0, Math.min(5, rating))
  return (
    <span
      className={`ll-stars ${className}`}
      role="img"
      aria-label={`Rated ${Number.isInteger(value) ? value : value.toFixed(1)} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i))
        return (
          <span key={i} className="ll-star" style={{ width: size, height: size }}>
            <StarIcon size={size} className="ll-star-empty" />
            {fill > 0 && (
              <span className="ll-star-fill" style={{ width: `${Math.round(fill * 100)}%` }}>
                <StarIcon size={size} />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}
