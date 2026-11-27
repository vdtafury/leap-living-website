'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PropertyListing } from '@/data/catalog'
import { PropertyCard } from '@/components/property/property-card'
import { ListingBriefCard } from '@/components/property/listing-brief-card'
import { HeroSelect, type HeroSelectOption } from '@/components/home/hero-select'
import {
  BedIcon,
  CloseIcon,
  CurrencyIcon,
  KeyIcon,
  LayersIcon,
  MapPinIcon,
} from '@/components/ui/icons'

type Mode = 'BUY' | 'RENT'
type SortKey = 'FEATURED' | 'PRICE_DESC' | 'PRICE_ASC' | 'SIZE_DESC'

interface PropertyListingBrowserProps {
  mode: Mode
  items: PropertyListing[]
  initialCommunity?: string
  initialType?: string
  initialBeds?: string
  initialBudget?: string
  initialSort?: string
}

/* Same option labels as the homepage search, so a search lands on the same words. */
const BED_OPTIONS: HeroSelectOption[] = [
  { value: 'ALL', label: 'Any' },
  { value: '3', label: '3+ Beds' },
  { value: '4', label: '4+ Beds' },
  { value: '5', label: '5+ Beds' },
]

const BUDGET_OPTIONS: Record<Mode, HeroSelectOption[]> = {
  BUY: [
    { value: 'ALL', label: 'Any price' },
    { value: 'UNDER_10M', label: 'Up to AED 10M' },
    { value: '10M_15M', label: 'AED 10M – 15M' },
    { value: 'OVER_15M', label: 'AED 15M +' },
  ],
  RENT: [
    { value: 'ALL', label: 'Any budget' },
    { value: 'UNDER_1M', label: 'Up to AED 1M / yr' },
    { value: 'OVER_1M', label: 'AED 1M + / yr' },
  ],
}

const SORT_OPTIONS: HeroSelectOption[] = [
  { value: 'FEATURED', label: 'Featured' },
  { value: 'PRICE_DESC', label: 'Price: high to low' },
  { value: 'PRICE_ASC', label: 'Price: low to high' },
  { value: 'SIZE_DESC', label: 'Size: largest first' },
]

const pick = (value: string, allowed: string[]) => (allowed.includes(value) ? value : 'ALL')

function inBudget(mode: Mode, budget: string, price: number) {
  if (mode === 'BUY') {
    if (budget === 'UNDER_10M') return price <= 10_000_000
    if (budget === '10M_15M') return price >= 10_000_000 && price <= 15_000_000
    if (budget === 'OVER_15M') return price > 15_000_000
  } else {
    if (budget === 'UNDER_1M') return price <= 1_000_000
    if (budget === 'OVER_1M') return price > 1_000_000
  }
  return true
}

/**
 * Buy / Rent listings: a light version of the homepage search (live filters, kept in the URL so
 * a filtered list can be shared), sorting, removable filter chips, then the cards. The grid
 * always ends with the brief card, which fills the empty end of the last row.
 */
export function PropertyListingBrowser({
  mode,
  items,
  initialCommunity = 'ALL',
  initialType = 'ALL',
  initialBeds = 'ALL',
  initialBudget = 'ALL',
  initialSort = 'FEATURED',
}: PropertyListingBrowserProps) {
  const communities = useMemo(
    () => Array.from(new Set(items.map((item) => item.community))).sort(),
    [items],
  )
  const types = useMemo(
    () => Array.from(new Set(items.map((item) => item.propertyType as string))).sort(),
    [items],
  )
  const budgetOptions = BUDGET_OPTIONS[mode]

  // Desktop: once the search bar sticks under the header it gets a glass band of its own.
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 120),
      { rootMargin: '-96px 0px 0px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const [community, setCommunity] = useState(() => pick(initialCommunity, communities))
  const [propertyType, setPropertyType] = useState(() => pick(initialType, types))
  const [minBeds, setMinBeds] = useState(() =>
    pick(
      initialBeds,
      BED_OPTIONS.map((o) => o.value),
    ),
  )
  const [budget, setBudget] = useState(() =>
    pick(
      initialBudget,
      budgetOptions.map((o) => o.value),
    ),
  )
  const [sort, setSort] = useState<SortKey>(() =>
    SORT_OPTIONS.some((o) => o.value === initialSort) ? (initialSort as SortKey) : 'FEATURED',
  )

  const communityOptions: HeroSelectOption[] = [
    { value: 'ALL', label: 'Any community' },
    ...communities.map((c) => ({ value: c, label: c })),
  ]
  const typeOptions: HeroSelectOption[] = [
    { value: 'ALL', label: 'All types' },
    ...types.map((t) => ({ value: t, label: t })),
  ]

  const results = useMemo(() => {
    const list = items.filter(
      (item) =>
        (community === 'ALL' || item.community === community) &&
        (propertyType === 'ALL' || item.propertyType === propertyType) &&
        (minBeds === 'ALL' || item.beds >= Number(minBeds)) &&
        inBudget(mode, budget, item.priceAed),
    )
    if (sort === 'PRICE_DESC') return [...list].sort((a, b) => b.priceAed - a.priceAed)
    if (sort === 'PRICE_ASC') return [...list].sort((a, b) => a.priceAed - b.priceAed)
    if (sort === 'SIZE_DESC') return [...list].sort((a, b) => b.areaSqFt - a.areaSqFt)
    // Featured first, otherwise the order the team set in the admin.
    return [...list].sort((a, b) => Number(b.featured) - Number(a.featured))
  }, [items, community, propertyType, minBeds, budget, sort, mode])

  // Keep the filters in the address bar (shareable, survives a refresh). No navigation.
  useEffect(() => {
    const params = new URLSearchParams()
    const values: Record<string, string> = {
      community,
      type: propertyType,
      beds: minBeds,
      budget,
      sort: sort === 'FEATURED' ? 'ALL' : sort,
    }
    for (const [key, val] of Object.entries(values)) if (val !== 'ALL') params.set(key, val)
    const qs = params.toString()
    const next = `${window.location.pathname}${qs ? `?${qs}` : ''}`
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, '', next)
    }
  }, [community, propertyType, minBeds, budget, sort])

  const label = (options: HeroSelectOption[], value: string) =>
    options.find((o) => o.value === value)?.label ?? value

  const chips = [
    community !== 'ALL' && { key: 'community', text: community, clear: () => setCommunity('ALL') },
    propertyType !== 'ALL' && {
      key: 'type',
      text: propertyType,
      clear: () => setPropertyType('ALL'),
    },
    minBeds !== 'ALL' && {
      key: 'beds',
      text: label(BED_OPTIONS, minBeds),
      clear: () => setMinBeds('ALL'),
    },
    budget !== 'ALL' && {
      key: 'budget',
      text: label(budgetOptions, budget),
      clear: () => setBudget('ALL'),
    },
  ].filter(Boolean) as { key: string; text: string; clear: () => void }[]

  const resetFilters = () => {
    setCommunity('ALL')
    setPropertyType('ALL')
    setMinBeds('ALL')
    setBudget('ALL')
  }

  const noun = results.length === 1 ? 'property' : 'properties'

  return (
    <div className="ll-lb">
      <div ref={sentinelRef} className="ll-lb-sentinel" aria-hidden="true" />
      <div className={`ll-lb-bar-wrap${stuck ? ' is-stuck' : ''}`}>
        <div className="ll-lb-bar" role="search" aria-label="Filter properties">
          <HeroSelect
            classPrefix="ll-fs"
            className="ll-fs-f-location"
            label="Location"
            icon={<MapPinIcon size={14} />}
            value={community}
            options={communityOptions}
            onChange={setCommunity}
            searchable
          />
          <HeroSelect
            classPrefix="ll-fs"
            className="ll-fs-f-type"
            label="Property type"
            shortLabel="Type"
            icon={<LayersIcon size={14} />}
            value={propertyType}
            options={typeOptions}
            onChange={setPropertyType}
          />
          <HeroSelect
            classPrefix="ll-fs"
            className="ll-fs-f-beds"
            label="Bedrooms"
            icon={<BedIcon size={14} />}
            value={minBeds}
            options={BED_OPTIONS}
            onChange={setMinBeds}
          />
          <HeroSelect
            classPrefix="ll-fs"
            className="ll-fs-f-budget"
            label={mode === 'BUY' ? 'Price (AED)' : 'Annual budget'}
            icon={<CurrencyIcon size={14} />}
            value={budget}
            options={budgetOptions}
            onChange={setBudget}
          />
          <a href="#ll-lb-results" className="ll-lb-count-btn">
            <span className="tabular-nums">{results.length}</span>
            <span>{results.length === 1 ? 'result' : 'results'}</span>
          </a>
        </div>
      </div>

      <div className="ll-lb-toolbar" id="ll-lb-results">
        <div className="ll-lb-summary">
          <h2 className="ll-lb-heading" aria-live="polite">
            <span className="tabular-nums">{results.length}</span>{' '}
            {mode === 'BUY' ? `${noun} for sale` : `${noun} for rent`}
          </h2>
          {chips.length > 0 && (
            <ul className="ll-lb-chips" aria-label="Active filters">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button type="button" className="ll-lb-chip" onClick={chip.clear}>
                    <span>{chip.text}</span>
                    <CloseIcon size={12} aria-hidden="true" />
                    <span className="sr-only"> (remove filter)</span>
                  </button>
                </li>
              ))}
              {chips.length > 1 && (
                <li>
                  <button type="button" className="ll-lb-clear" onClick={resetFilters}>
                    Clear all
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
        <HeroSelect
          classPrefix="ll-fs"
          className="ll-fs-sort"
          label="Sort by"
          icon={null}
          value={sort}
          options={SORT_OPTIONS}
          onChange={(v) => setSort(v as SortKey)}
        />
      </div>

      {results.length === 0 ? (
        <div className="ll-lb-empty">
          <span className="ll-lb-empty-icon" aria-hidden="true">
            <KeyIcon size={26} />
          </span>
          <h3>No properties match these filters</h3>
          <p>
            Widen the location or price, or tell us what you need and our advisory desk will look
            for it, including off-market homes.
          </p>
          <div className="ll-lb-empty-actions">
            <button type="button" onClick={resetFilters} className="ll-btn ll-btn-primary">
              Show all properties
            </button>
            <Link href="/contact" className="ll-btn ll-btn-outline">
              Send your brief
            </Link>
          </div>
        </div>
      ) : (
        <div className="ll-cards-grid ll-lb-grid">
          {results.map((item) => (
            <PropertyCard key={item.slug} property={item} />
          ))}
          <ListingBriefCard mode={mode} count={results.length} />
        </div>
      )}
    </div>
  )
}
