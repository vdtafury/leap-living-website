/**
 * Outline keyhole-in-circle mark, traced from the client-supplied logo mark
 * (`public/brand/logo-mark-teal.png`). Used only as a large decorative watermark,
 * the same way the Brand Guidelines use it on the cover and letterhead.
 */
export function KeyholeMark({
  className,
  strokeWidth = 2.4,
}: {
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 132 132"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="66" cy="66" r="62.5" strokeWidth={strokeWidth} />
      <path
        d="M56.5 68.5A19 19 0 1 1 75.5 68.5L82 101.5H50Z"
        strokeWidth={strokeWidth * 0.66}
        strokeLinejoin="miter"
      />
    </svg>
  )
}
