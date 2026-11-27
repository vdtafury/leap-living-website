import type { SVGProps } from 'react'

/*
 * Icons are drawn once, in the hidden sprite at the end of every page (icon-sprite.tsx), and
 * each icon here is a <use> pointing at its symbol. The outer <svg> keeps the presentation
 * attributes (stroke, width, fill, linecap), so they still inherit into the symbol and can be
 * overridden per use. Shapes: icon-glyphs.tsx. AvatarIcon stays inline (CSS-coloured parts).
 */

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
      <use href="#ll-i-arrow-up-right" />
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
      <use href="#ll-i-arrow-right" />
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
      <use href="#ll-i-chevron-right" />
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
      <use href="#ll-i-map-pin" />
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
      <use href="#ll-i-bed" />
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
      <use href="#ll-i-bath" />
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
      <use href="#ll-i-area" />
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
      <use href="#ll-i-check" />
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
      <use href="#ll-i-menu" />
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
      <use href="#ll-i-close" />
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
      <use href="#ll-i-phone" />
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
      <use href="#ll-i-mail" />
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
      <use href="#ll-i-building" />
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
      <use href="#ll-i-calculator" />
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
      <use href="#ll-i-layers" />
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
      <use href="#ll-i-currency" />
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
      <use href="#ll-i-whats-app" />
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
      <use href="#ll-i-linked-in" />
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
      <use href="#ll-i-instagram" />
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
      <use href="#ll-i-facebook" />
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
      <use href="#ll-i-tik-tok" />
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
      <use href="#ll-i-search" />
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
      <use href="#ll-i-chevron-down" />
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
      <use href="#ll-i-arrow-left" />
    </svg>
  )
}

/* ---- Line icons (service cards, advice card; the stats band was removed in D-52) ---- */
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

export function StackIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <use href="#ll-i-stack" />
    </LineIcon>
  )
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <use href="#ll-i-shield-check" />
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
      <use href="#ll-i-home" />
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
    <LineIcon size={size} strokeWidth={1.7} fill={filled ? 'currentColor' : 'none'} {...props}>
      <use href="#ll-i-heart" />
    </LineIcon>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <use href="#ll-i-user" />
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
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <use href="#ll-i-star" />
    </svg>
  )
}

/* ---- Service cards (D-48). Handshake, compass and key paths after Lucide (ISC licence). ---- */

export function ChartUpIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <use href="#ll-i-chart-up" />
    </LineIcon>
  )
}

export function HandshakeIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <use href="#ll-i-handshake" />
    </LineIcon>
  )
}

export function CompassIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <use href="#ll-i-compass" />
    </LineIcon>
  )
}

export function KeyIcon(props: IconProps) {
  return (
    <LineIcon {...props}>
      <use href="#ll-i-key" />
    </LineIcon>
  )
}

/* ---- Property page: gallery and share (round caps, same weight as the arrows) ---- */
function StrokeIcon({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
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

export function ChevronLeftIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <use href="#ll-i-chevron-left" />
    </StrokeIcon>
  )
}

export function ShareIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <use href="#ll-i-share" />
    </StrokeIcon>
  )
}

export function ImagesIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <use href="#ll-i-images" />
    </StrokeIcon>
  )
}
