'use client'

import { useMemo, useState } from 'react'
import type { PropertyListing } from '@/data/catalog'
import { PropertyCard } from '@/components/property/property-card'

interface PropertyListingBrowserProps {
  mode: 'BUY' | 'RENT'
  items: PropertyListing[]
  initialCommunity?: string
  initialType?: string
  initialBudget?: string
}

export function PropertyListingBrowser({
  mode,
  items,
  initialCommunity = 'ALL',
  initialType = 'ALL',
  initialBudget = 'ALL',
}: PropertyListingBrowserProps) {
  const [community, setCommunity] = useState(initialCommunity)
  const [propertyType, setPropertyType] = useState(initialType)
  const [minBeds, setMinBeds] = useState('ALL')
  const [budget, setBudget] = useState(initialBudget)

  const communities = useMemo(
    () => Array.from(new Set(items.map((item) => item.community))).sort(),
    [items],
  )

  const types = useMemo(
    () => Array.from(new Set(items.map((item) => item.propertyType))).sort(),
    [items],
  )

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (community !== 'ALL' && item.community !== community) return false
      if (propertyType !== 'ALL' && item.propertyType !== propertyType) return false
      if (minBeds !== 'ALL' && item.beds < Number(minBeds)) return false

      if (mode === 'BUY') {
        if (budget === 'UNDER_10M' && item.priceAed > 10000000) return false
        if (budget === '10M_15M' && (item.priceAed < 10000000 || item.priceAed > 15000000))
          return false
        if (budget === 'OVER_15M' && item.priceAed <= 15000000) return false
      } else {
        if (budget === 'UNDER_1M' && item.priceAed > 1000000) return false
        if (budget === 'OVER_1M' && item.priceAed <= 1000000) return false
      }
      return true
    })
  }, [items, community, propertyType, minBeds, budget, mode])

  const resetFilters = () => {
    setCommunity('ALL')
    setPropertyType('ALL')
    setMinBeds('ALL')
    setBudget('ALL')
  }

  return (
    <div>
      <div className="ll-filter-bar">
        <div>
          <label htmlFor="flt-community" className="ll-field-label">
            District / Community
          </label>
          <div className="ll-select-wrap">
            <select
              id="flt-community"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="ll-select"
            >
              <option value="ALL">All Districts</option>
              {communities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="flt-type" className="ll-field-label">
            Asset Type
          </label>
          <div className="ll-select-wrap">
            <select
              id="flt-type"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="ll-select"
            >
              <option value="ALL">All Property Types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="flt-beds" className="ll-field-label">
            Bedrooms
          </label>
          <div className="ll-select-wrap">
            <select
              id="flt-beds"
              value={minBeds}
              onChange={(e) => setMinBeds(e.target.value)}
              className="ll-select"
            >
              <option value="ALL">Any Bedroom Count</option>
              <option value="3">3+ Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="flt-budget" className="ll-field-label">
            {mode === 'BUY' ? 'Price Allocation' : 'Annual Budget'}
          </label>
          <div className="ll-select-wrap">
            <select
              id="flt-budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="ll-select"
            >
              <option value="ALL">All Price Tiers</option>
              {mode === 'BUY' ? (
                <>
                  <option value="UNDER_10M">Up to AED 10,000,000</option>
                  <option value="10M_15M">AED 10M – AED 15M</option>
                  <option value="OVER_15M">Above AED 15,000,000</option>
                </>
              ) : (
                <>
                  <option value="UNDER_1M">Up to AED 1,000,000 / yr</option>
                  <option value="OVER_1M">Above AED 1,000,000 / yr</option>
                </>
              )}
            </select>
          </div>
        </div>

        <button type="button" onClick={resetFilters} className="ll-btn ll-btn-outline">
          Reset
        </button>
      </div>

      <div
        style={{
          marginBottom: '1.25rem',
          fontSize: '0.84rem',
          color: 'var(--body-text)',
        }}
      >
        Showing <strong style={{ color: 'var(--heading)' }}>{filtered.length}</strong> curated{' '}
        {mode === 'BUY' ? 'acquisition' : 'leasing'} mandates
      </div>

      {filtered.length === 0 ? (
        <div className="ll-form-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>No Properties Match These Filters</h3>
          <p style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            Broaden your district or price parameters, or contact our private advisory desk for
            off-market mandates.
          </p>
          <button type="button" onClick={resetFilters} className="ll-btn ll-btn-primary">
            Show All Listings
          </button>
        </div>
      ) : (
        <div className="ll-cards-grid">
          {filtered.map((item) => (
            <PropertyCard key={item.slug} property={item} />
          ))}
        </div>
      )}
    </div>
  )
}
