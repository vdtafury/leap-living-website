'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react'
import { ArrowRightIcon } from '@/components/ui/icons'

export interface DialService {
  title: string
  desc: string
  tag?: string
  featured?: boolean
}

/** One stage of the dial turns every AUTOPLAY_MS while the dial is in view and untouched. */
const AUTOPLAY_MS = 6500
/** Dial geometry, in the SVG's 600 × 600 box. */
const C = 300
const TRACK_R = 222
/* Minute track inside the face, like a watch dial (outside it would meet the labels) */
const TICK_IN = 176
const TICK_OUT = 186
const TICKS = 60
const CIRC = 2 * Math.PI * TRACK_R

const pad = (n: number) => String(n).padStart(2, '0')

/* The keyhole of the logo mark (keyhole-mark.tsx, 132-unit box: head r 19 centred at 66,52),
   scaled 3.8× with its head at (300, 268): the stage number sits in the head. */
const KEYHOLE = 'M263.9 330.7A72.2 72.2 0 1 1 336.1 330.7L360.8 456.1H239.2Z'

/** Angle of stage i (degrees, 0 = 12 o'clock, clockwise). */
const angleOf = (i: number, n: number) => (360 / n) * i

/**
 * "The lifecycle dial" (D-48, owner: "something incredible, a new idea"). The services are the
 * stations of one loop around the brand mark (the Leap Living logo is a keyhole in a circle),
 * drawn like a watch bezel: minute ticks, a teal arc filled up to the current stage, and a thin
 * hand creeping towards the next stage while the dial turns by itself. End-to-end, literally:
 * the last stage leads back to the first.
 *
 * Stations are tabs (click, ←/→, Home/End); the text of every stage is in the server HTML,
 * stacked in one grid cell so the height never jumps. It turns by itself only while in view,
 * pauses on hover / focus, stops for good after the visitor picks a stage, and never turns
 * under prefers-reduced-motion. Phones: the dial above, the text below, swipe to turn.
 */
export function ServiceDial({ items, label }: { items: DialService[]; label: string }) {
  const n = items.length
  const [active, setActive] = useState(0)
  /** Arc length in stages; n while closing the loop (then reset to 0 without animation). */
  const [arc, setArc] = useState(0)
  const [instant, setInstant] = useState(false)
  const [auto, setAuto] = useState(true)
  const [inView, setInView] = useState(false)
  const [hold, setHold] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const swipe = useRef<{ x: number; y: number } | null>(null)

  const go = useCallback(
    (next: number, wrap = false) => {
      const target = ((next % n) + n) % n
      if (wrap && target === 0 && n > 1) {
        // Close the loop: fill the last stretch, then reset quietly to the start
        setArc(n)
        window.setTimeout(() => {
          setInstant(true)
          setArc(0)
          window.requestAnimationFrame(() => window.requestAnimationFrame(() => setInstant(false)))
        }, 900)
      } else {
        setArc(target)
      }
      setActive(target)
    },
    [n],
  )

  const pick = (i: number) => {
    setAuto(false)
    go(i)
  }

  // Only turn while the dial is on screen, and never for visitors who asked for less motion
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const running = auto && inView && !hold && n > 1

  useEffect(() => {
    if (!running) return
    const id = window.setTimeout(() => go(active + 1, true), AUTOPLAY_MS)
    return () => window.clearTimeout(id)
  }, [running, active, go])

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + n) % n
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = n - 1
    if (next < 0) return
    e.preventDefault()
    pick(next)
    tabsRef.current[next]?.focus()
  }

  // Swipe on the text (phones): left = next stage, right = previous
  const onTouchStart = (e: ReactTouchEvent) => {
    const t = e.touches[0]
    swipe.current = t ? { x: t.clientX, y: t.clientY } : null
  }
  const onTouchEnd = (e: ReactTouchEvent) => {
    const s = swipe.current
    const t = e.changedTouches[0]
    swipe.current = null
    if (!s || !t) return
    const dx = t.clientX - s.x
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(t.clientY - s.y) * 1.2) return
    pick(dx < 0 ? (active + 1) % n : (active - 1 + n) % n)
  }

  const next = (active + 1) % n
  const ticks = Array.from({ length: TICKS }, (_, t) => t)
  const stageTick = (t: number) => (t * n) % TICKS === 0
  const reachedTick = (t: number) => {
    const deg = (360 / TICKS) * t
    return deg <= angleOf(Math.min(arc, n), n) + 0.01
  }

  return (
    <div
      ref={rootRef}
      className="ll-sd"
      data-running={running}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold(false)
      }}
    >
      {/* ---------- Text of the current stage ---------- */}
      <div className="ll-sd-copy" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="ll-sd-stack">
          {items.map((item, i) => (
            <div
              key={`${item.title}-${i}`}
              id={`ll-sd-panel-${i}`}
              role="tabpanel"
              aria-labelledby={`ll-sd-tab-${i}`}
              className="ll-sd-panel"
              data-active={i === active}
            >
              <div className="ll-sd-meta">
                <span className="ll-sd-stage tabular-nums">
                  Stage {pad(i + 1)}
                  <span className="ll-sd-stage-of"> / {pad(n)}</span>
                </span>
                {item.featured && item.tag && <span className="ll-sd-tag">{item.tag}</span>}
              </div>
              <h3 className="ll-sd-title">{item.title}</h3>
              <p className="ll-sd-desc">{item.desc}</p>
            </div>
          ))}
        </div>

        {n > 1 && (
          <button type="button" className="ll-sd-next" onClick={() => pick(next)}>
            <span className="ll-sd-next-label">
              {next === 0 ? 'Back to the start' : 'Next stage'}
            </span>
            <span className="ll-sd-next-title">{items[next].title}</span>
            <span className="ll-sd-next-icon" aria-hidden="true">
              <ArrowRightIcon size={18} />
            </span>
          </button>
        )}
      </div>

      {/* ---------- The dial ---------- */}
      <div className="ll-sd-dial">
        <div className="ll-sd-ring">
          <svg className="ll-sd-svg" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
            <defs>
              <radialGradient id="ll-sd-face" cx="50%" cy="38%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#eef6f6" />
              </radialGradient>
            </defs>
            {/* face */}
            <circle cx={C} cy={C} r={TRACK_R - 26} fill="url(#ll-sd-face)" className="ll-sd-face" />
            {/* minute track */}
            <g className="ll-sd-ticks">
              {ticks.map((t) => {
                const a = ((360 / TICKS) * t * Math.PI) / 180
                const major = stageTick(t)
                const r1 = major ? TICK_IN - 8 : TICK_IN
                return (
                  <line
                    key={t}
                    x1={C + r1 * Math.sin(a)}
                    y1={C - r1 * Math.cos(a)}
                    x2={C + TICK_OUT * Math.sin(a)}
                    y2={C - TICK_OUT * Math.cos(a)}
                    className="ll-sd-tick"
                    data-major={major}
                    data-on={reachedTick(t)}
                  />
                )
              })}
            </g>
            {/* the keyhole of the logo: the ring is its circle */}
            <path d={KEYHOLE} className="ll-sd-keyhole" />
            {/* track + progress arc + the hand towards the next stage */}
            <circle cx={C} cy={C} r={TRACK_R} className="ll-sd-track" />
            <circle
              cx={C}
              cy={C}
              r={TRACK_R}
              className="ll-sd-arc"
              data-instant={instant}
              style={{
                strokeDasharray: `${CIRC} ${CIRC}`,
                strokeDashoffset: CIRC - (CIRC * Math.min(arc, n)) / n,
                transform: 'rotate(-90deg)',
              }}
            />
            {n > 1 && (
              <circle
                key={`hand-${active}-${running}`}
                cx={C}
                cy={C}
                r={TRACK_R}
                className="ll-sd-hand"
                style={
                  {
                    '--sd-len': CIRC / n,
                    '--sd-circ': CIRC,
                    '--sd-from': `${-90 + angleOf(active, n)}deg`,
                    '--sd-ms': `${AUTOPLAY_MS}ms`,
                  } as CSSProperties
                }
              />
            )}
          </svg>

          {/* brand mark + stage number in the centre */}
          <div className="ll-sd-center" aria-hidden="true">
            <span key={active} className="ll-sd-num tabular-nums">
              {pad(active + 1)}
            </span>
            <span className="ll-sd-of tabular-nums">of {pad(n)}</span>
          </div>

          {/* stations */}
          <div className="ll-sd-stations" role="tablist" aria-label={label}>
            {items.map((item, i) => {
              const deg = angleOf(i, n)
              const rad = (deg * Math.PI) / 180
              const x = 50 + (TRACK_R / 600) * 100 * Math.sin(rad)
              const y = 50 - (TRACK_R / 600) * 100 * Math.cos(rad)
              const sx = Math.sin(rad)
              const side =
                sx > 0.35 ? 'right' : sx < -0.35 ? 'left' : Math.cos(rad) > 0 ? 'top' : 'bottom'
              return (
                <button
                  key={`${item.title}-${i}`}
                  ref={(el) => {
                    tabsRef.current[i] = el
                  }}
                  id={`ll-sd-tab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-controls={`ll-sd-panel-${i}`}
                  tabIndex={i === active ? 0 : -1}
                  className="ll-sd-station"
                  data-active={i === active}
                  data-reached={i < active || (i === 0 && arc === n)}
                  data-side={side}
                  style={{ left: `${x}%`, top: `${y}%` } as CSSProperties}
                  onClick={() => pick(i)}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  <span className="ll-sd-dot tabular-nums">{pad(i + 1)}</span>
                  <span className="ll-sd-label">{item.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
