'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { HeroSelect, type HeroSelectOption } from '@/components/home/hero-select'
import { BedIcon, CurrencyIcon, LayersIcon, MapPinIcon, SearchIcon } from '@/components/ui/icons'

type SearchMode = 'BUY' | 'RENT'

const MODES: { id: SearchMode; label: string }[] = [
  { id: 'BUY', label: 'Buy' },
  { id: 'RENT', label: 'Rent' },
]

const TYPE_OPTIONS: HeroSelectOption[] = [
  { value: 'ALL', label: 'All types' },
  { value: 'Villa', label: 'Villa' },
  { value: 'Penthouse', label: 'Penthouse' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Duplex', label: 'Duplex' },
  { value: 'Commercial', label: 'Commercial' },
]

const BED_OPTIONS: HeroSelectOption[] = [
  { value: 'ALL', label: 'Any' },
  { value: '3', label: '3+ Beds' },
  { value: '4', label: '4+ Beds' },
  { value: '5', label: '5+ Beds' },
]

const BUDGET_OPTIONS: Record<'BUY' | 'RENT', HeroSelectOption[]> = {
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

interface HeroSearchBarProps {
  /** Communities available per mode (derived from the catalogue on the server). */
  communities: Record<SearchMode, string[]>
}

export function HeroSearchBar({ communities }: HeroSearchBarProps) {
  const router = useRouter()
  const [mode, setMode] = useState<SearchMode>('BUY')
  const [community, setCommunity] = useState('ALL')
  const [propertyType, setPropertyType] = useState('ALL')
  const [beds, setBeds] = useState('ALL')
  const [budget, setBudget] = useState('ALL')

  const target = mode === 'BUY' ? '/buy' : '/rent'
  const budgetOptions = BUDGET_OPTIONS[mode]

  const communityOptions: HeroSelectOption[] = [
    { value: 'ALL', label: 'Any community' },
    ...communities[mode].map((c) => ({ value: c, label: c })),
  ]

  const switchMode = (next: SearchMode) => {
    setMode(next)
    setBudget('ALL')
    setPropertyType('ALL')
    if (community !== 'ALL' && !communities[next].includes(community)) setCommunity('ALL')
  }

  const buildHref = () => {
    const params = new URLSearchParams()
    const values: Record<string, string> = { community, type: propertyType, beds, budget }
    for (const [key, val] of Object.entries(values)) {
      if (val && val !== 'ALL') params.set(key, val)
    }
    const qs = params.toString()
    return qs ? `${target}?${qs}` : target
  }

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.push(buildHref())
  }

  const modeIndex = MODES.findIndex((m) => m.id === mode)

  return (
    <form onSubmit={handleSearch} className="ll-hs" role="search" aria-label="Property search">
      <div className="ll-hs-top">
        <div
          className="ll-hs-modes"
          role="group"
          aria-label="Search type"
          style={{ ['--mode-index' as string]: modeIndex }}
        >
          <span className="ll-hs-mode-thumb" aria-hidden="true" />
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              className={`ll-hs-mode${mode === m.id ? ' is-active' : ''}`}
              onClick={() => switchMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ll-hs-bar">
        <HeroSelect
          className="ll-hs-f-location"
          label="Location"
          icon={<MapPinIcon size={14} />}
          value={community}
          options={communityOptions}
          onChange={setCommunity}
          searchable
        />
        <HeroSelect
          className="ll-hs-f-type"
          label="Property type"
          shortLabel="Type"
          icon={<LayersIcon size={14} />}
          value={propertyType}
          options={TYPE_OPTIONS}
          onChange={setPropertyType}
        />
        <HeroSelect
          className="ll-hs-f-beds"
          label="Bedrooms"
          icon={<BedIcon size={14} />}
          value={beds}
          options={BED_OPTIONS}
          onChange={setBeds}
        />
        <HeroSelect
          className="ll-hs-f-budget"
          label={mode === 'BUY' ? 'Price (AED)' : 'Annual budget'}
          icon={<CurrencyIcon size={14} />}
          value={budget}
          options={budgetOptions}
          onChange={setBudget}
        />

        <button type="submit" className="ll-hs-submit">
          <SearchIcon size={18} />
          <span>Search</span>
        </button>
      </div>
    </form>
  )
}
