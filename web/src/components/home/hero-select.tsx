'use client'

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { CheckIcon, ChevronDownIcon, SearchIcon } from '@/components/ui/icons'

export interface HeroSelectOption {
  value: string
  label: string
}

interface HeroSelectProps {
  label: string
  /** Optional shorter label shown on very narrow screens. */
  shortLabel?: string
  icon: ReactNode
  value: string
  options: HeroSelectOption[]
  onChange: (value: string) => void
  /** Shows a filter input at the top of the list. */
  searchable?: boolean
  disabled?: boolean
  className?: string
  /**
   * Class-name prefix for every element (default `ll-hs`, the homepage's glass search).
   * The listing pages pass `ll-fs` for a light theme, so the two never share rules.
   */
  classPrefix?: string
}

/**
 * Glass dropdown used by the hero search.
 * Button + listbox pattern (WAI-ARIA APG "select-only combobox"):
 * - Enter / Space / ArrowDown / ArrowUp open; arrows, Home, End move;
 *   Enter selects; Escape closes and returns focus; Tab closes.
 * - Type-ahead on the list; optional filter input for long lists.
 * - Opens upwards automatically when there is not enough room below.
 */
export function HeroSelect({
  label,
  shortLabel,
  icon,
  value,
  options,
  onChange,
  searchable = false,
  disabled = false,
  className = '',
  classPrefix: p = 'll-hs',
}: HeroSelectProps) {
  const uid = useId()
  const buttonId = `${uid}-button`
  const listId = `${uid}-list`
  const labelId = `${uid}-label`

  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const filterRef = useRef<HTMLInputElement>(null)
  const typeahead = useRef({ text: '', timer: 0 })

  const [open, setOpen] = useState(false)
  const [placeUp, setPlaceUp] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const selected = options.find((o) => o.value === value) ?? options[0]

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  }, [options, query])

  const openList = () => {
    if (disabled) return
    const rect = rootRef.current?.getBoundingClientRect()
    if (rect) {
      const below = window.innerHeight - rect.bottom
      setPlaceUp(below < 300 && rect.top > below)
    }
    setQuery('')
    setActiveIndex(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    )
    setOpen(true)
  }

  const close = (restoreFocus = true) => {
    setOpen(false)
    if (restoreFocus) buttonRef.current?.focus()
  }

  const commit = (index: number) => {
    const option = visible[index]
    if (!option) return
    onChange(option.value)
    close()
  }

  // Focus the filter input (or the list) when opening.
  useEffect(() => {
    if (!open) return
    if (searchable) filterRef.current?.focus()
    else listRef.current?.focus()
  }, [open, searchable])

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open) return
    const el = document.getElementById(`${uid}-opt-${activeIndex}`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex, uid])

  // Close on outside pointer down.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const onButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault()
      openList()
    }
  }

  const onListKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const last = visible.length - 1
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(last, i + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(0, i - 1))
        break
      case 'Home':
        if (!searchable) {
          e.preventDefault()
          setActiveIndex(0)
        }
        break
      case 'End':
        if (!searchable) {
          e.preventDefault()
          setActiveIndex(last)
        }
        break
      case 'Enter':
        e.preventDefault()
        commit(activeIndex)
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        // Type-ahead when there is no filter input.
        if (!searchable && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
          const t = typeahead.current
          window.clearTimeout(t.timer)
          t.text += e.key.toLowerCase()
          t.timer = window.setTimeout(() => (t.text = ''), 600)
          const hit = visible.findIndex((o) => o.label.toLowerCase().startsWith(t.text))
          if (hit >= 0) setActiveIndex(hit)
        }
    }
  }

  const activeId = visible[activeIndex] ? `${uid}-opt-${activeIndex}` : undefined

  return (
    <div
      ref={rootRef}
      className={`${p}-field${open ? ' is-open' : ''}${disabled ? ' is-disabled' : ''} ${className}`}
    >
      <span id={labelId} className={`${p}-label`}>
        {icon}
        {shortLabel ? (
          <>
            <span className={`${p}-label-full`}>{label}</span>
            <span className={`${p}-label-short`} aria-hidden="true">
              {shortLabel}
            </span>
          </>
        ) : (
          label
        )}
      </span>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        className={`${p}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${buttonId}`}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onButtonKeyDown}
      >
        <span className={`${p}-value`}>{selected?.label}</span>
        <ChevronDownIcon className={`${p}-chevron`} />
      </button>

      {open && (
        <div className={`${p}-pop${placeUp ? ' is-up' : ''}`}>
          {searchable && (
            <div className={`${p}-filter`}>
              <SearchIcon size={15} />
              <input
                ref={filterRef}
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-autocomplete="list"
                value={query}
                placeholder={`Search ${label.toLowerCase()}`}
                aria-label={`Filter ${label}`}
                aria-controls={listId}
                aria-activedescendant={activeId}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={onListKeyDown}
              />
            </div>
          )}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            tabIndex={-1}
            aria-activedescendant={searchable ? undefined : activeId}
            className={`${p}-options`}
            onKeyDown={onListKeyDown}
          >
            {visible.length === 0 && <li className={`${p}-empty`}>No matches</li>}
            {visible.map((o, i) => {
              const isSelected = o.value === value
              return (
                <li
                  key={o.value}
                  id={`${uid}-opt-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`${p}-option${i === activeIndex ? ' is-active' : ''}${
                    isSelected ? ' is-selected' : ''
                  }`}
                  onPointerEnter={() => setActiveIndex(i)}
                  onClick={() => commit(i)}
                >
                  <span>{o.label}</span>
                  {isSelected && <CheckIcon size={14} />}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
