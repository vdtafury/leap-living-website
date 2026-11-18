import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
}

export function ArrowUpRightIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

export function ArrowRightIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="square"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function ChevronRightIcon({ size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      aria-hidden="true"
      {...props}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function MapPinIcon({ size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  )
}

export function BedIcon({ size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 18V8" />
      <path d="M3 14h18v4" />
      <path d="M21 14v-2a3 3 0 0 0-3-3H9v5" />
      <circle cx="6.5" cy="10.5" r="1.5" />
    </svg>
  )
}

export function BathIcon({ size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
      <path d="M6 12V6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1" />
      <path d="M7 19v2M17 19v2" />
    </svg>
  )
}

export function AreaIcon({ size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      <rect x="7" y="7" width="10" height="10" />
    </svg>
  )
}

export function CheckIcon({ size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      aria-hidden="true"
      {...props}
    >
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  )
}

export function MenuIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function CloseIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      aria-hidden="true"
      {...props}
    >
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  )
}

export function PhoneIcon({ size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      {...props}
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9Z" />
    </svg>
  )
}

export function MailIcon({ size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

export function BuildingIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      {...props}
    >
      <path d="M3 21h18" />
      <path d="M5 21V5l7-2v18" />
      <path d="M19 21V9l-7-2" />
      <path d="M8.5 9h1M8.5 13h1M15 13h1" />
    </svg>
  )
}

export function CalculatorIcon({ size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      {...props}
    >
      <rect x="4" y="2.5" width="16" height="19" rx="1.5" />
      <path d="M8 7h8v3H8z" />
      <path d="M8 14h1.5M11.75 14h1.5M15.5 14H17M8 17.5h1.5M11.75 17.5h1.5M15.5 17.5H17" />
    </svg>
  )
}

export function LayersIcon({ size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3 2.5 8 12 13l9.5-5L12 3Z" />
      <path d="m2.5 12.5 9.5 5 9.5-5" />
      <path d="m2.5 17 9.5 5 9.5-5" />
    </svg>
  )
}

export function CurrencyIcon({ size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      {...props}
    >
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 7v5c0 1.66 3.13 3 7 3s7-1.34 7-3V7" />
      <path d="M5 12v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5" />
    </svg>
  )
}

/** WhatsApp glyph (Simple Icons, CC0). */
export function WhatsAppIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

export function LinkedInIcon({ size = 17, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

export function InstagramIcon({ size = 17, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FacebookIcon({ size = 17, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M13.5 21v-7.6h2.56l.38-2.97H13.5V8.54c0-.86.24-1.45 1.47-1.45h1.57V4.44A21 21 0 0 0 14.25 4.3c-2.27 0-3.82 1.39-3.82 3.93v2.2H7.86v2.97h2.57V21h3.07z" />
    </svg>
  )
}

export function TikTokIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M16.6 3c.32 2.1 1.53 3.45 3.65 3.6v2.73a6.6 6.6 0 0 1-3.6-1.05v5.65c0 3.83-4.14 6.22-7.46 4.31-3.65-2.1-2.85-7.82 1.42-8.75.5-.11 1.03-.13 1.55-.07v2.9a2.55 2.55 0 0 0-2.95 2.09 2.58 2.58 0 0 0 4.9 1.38c.14-.33.2-.69.19-1.05V3h2.3z" />
    </svg>
  )
}

export function SearchIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  )
}

export function ChevronDownIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function ArrowLeftIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  )
}

/* ---- Credential icons (homepage stats band) ---- */
function LineIcon({ size = 24, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </LineIcon>
  )
}

export function StackIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M12 3 2.5 8 12 13l9.5-5L12 3Z" />
      <path d="m2.5 12 9.5 5 9.5-5" />
      <path d="m2.5 16 9.5 5 9.5-5" />
    </LineIcon>
  )
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.3 7.5 9.5 4.4-1.2 7.5-4.9 7.5-9.5V6L12 3Z" />
      <path d="m8.75 12 2.25 2.25 4.25-4.5" />
    </LineIcon>
  )
}

export function UsersIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
      <circle cx="17" cy="9" r="2.75" />
      <path d="M17.25 13.6c2.5.3 4.25 2.6 4.25 5.4" />
    </LineIcon>
  )
}

/**
 * Generic reviewer avatars (no photos of people on the homepage, D-17), in the spirit of the
 * man / woman icons on providentestate.com. The parent clips them to a circle.
 */
export function AvatarIcon({ variant, size = 60 }: { variant: 'man' | 'woman'; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 70 70"
      aria-hidden="true"
      focusable="false"
      className="ll-avatar-svg"
    >
      <rect width="70" height="70" className="ll-avatar-bg" />
      {variant === 'man' ? (
        <>
          <path className="ll-avatar-body" d="M8 72c0-15 12-25 27-25s27 10 27 25Z" />
          <path className="ll-avatar-skin" d="M30 38h10v11.5c-2.9 2.6-7.1 2.6-10 0Z" />
          <circle className="ll-avatar-skin" cx="35" cy="28" r="13" />
          <path
            className="ll-avatar-hair"
            d="M22 27.5C21.3 18.6 26.8 13 35 13c8.4 0 13.8 5.7 13 14.5-1.5-4.8-4.3-7-8-7.9-3.5 2-9 2.8-14 1.7-2.1 1.4-3.1 3.4-4 6.2Z"
          />
        </>
      ) : (
        <>
          <path
            className="ll-avatar-hair"
            d="M20 31c0-11 6.6-18.5 15-18.5S50 20 50 31v15c0 2.4-1.5 3.8-3.9 3.8H23.9c-2.4 0-3.9-1.4-3.9-3.8Z"
          />
          <path className="ll-avatar-body" d="M9 72c0-14.5 11.6-24.5 26-24.5S61 57.5 61 72Z" />
          <path className="ll-avatar-skin" d="M30.5 39h9v10.5c-2.6 2.4-6.4 2.4-9 0Z" />
          <circle className="ll-avatar-skin" cx="35" cy="29.5" r="12" />
          <path
            className="ll-avatar-hair"
            d="M23 29c.4-8 5.3-13 12-13 7 0 11.8 5.1 12 13-3.7-1.3-8.1-4.1-11.1-8.1-2.9 3.7-7.3 6.7-12.9 8.1Z"
          />
        </>
      )}
    </svg>
  )
}

export function HomeIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M3.5 10.5 12 4l8.5 6.5" />
      <path d="M5.5 9v11h13V9" />
      <path d="M10 20v-5.5h4V20" />
    </LineIcon>
  )
}

/* ---- Website accounts (D-40) ---- */

/** Heart for saved items. `filled` = saved. */
export function HeartIcon({
  size = 18,
  filled = false,
  ...props
}: IconProps & { filled?: boolean }) {
  return (
    <LineIcon size={size} strokeWidth={1.7} {...props}>
      <path
        d="M12 20.25s-7.75-4.6-7.75-10.4A4.35 4.35 0 0 1 12 7.2a4.35 4.35 0 0 1 7.75 2.65c0 5.8-7.75 10.4-7.75 10.4Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </LineIcon>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <circle cx="12" cy="8.25" r="3.75" />
      <path d="M4.5 20.25c0-4.1 3.35-7 7.5-7s7.5 2.9 7.5 7" />
    </LineIcon>
  )
}

/** Five-point star (reviews, D-44). Filled with currentColor. */
export function StarIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        fill="currentColor"
        d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.45l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95z"
      />
    </svg>
  )
}

/* ---- Service cards (D-48). Handshake, compass and key paths after Lucide (ISC licence). ---- */

export function ChartUpIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="M5 20v-4" />
      <path d="M10 20v-6.5" />
      <path d="M15 20v-5" />
      <path d="M20 20v-8.5" />
      <path d="m4 11 5-4 4 2.5L20 4" />
      <path d="M16 4h4v4" />
    </LineIcon>
  )
}

export function HandshakeIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </LineIcon>
  )
}

export function CompassIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-1.6 4.8a1 1 0 0 1-.6.6l-4.8 1.6 1.6-4.8a1 1 0 0 1 .6-.6l4.8-1.6Z" />
    </LineIcon>
  )
}

export function KeyIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <circle cx="15.5" cy="8.5" r="5" />
      <path d="M11.9 12.1 3.5 20.5" />
      <path d="m6 18 2.5 2.5" />
      <path d="m8.5 15.5 2 2" />
      <circle cx="16.5" cy="7.5" r="0.6" fill="currentColor" />
    </LineIcon>
  )
}
