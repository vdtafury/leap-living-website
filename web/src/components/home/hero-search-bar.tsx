'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRightIcon,
  CurrencyIcon,
  LayersIcon,
  MapPinIcon,
} from '@/components/ui/icons'

export function HeroSearchBar() {
  const router = useRouter()
  const [tab, setTab] = useState<'BUY' | 'RENT' | 'COMMERCIAL'>('BUY')
  const [community, setCommunity] = useState('ALL')
  const [propertyType, setPropertyType] = useState('ALL')
  const [budget, setBudget] = useState('ALL')

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (community !== 'ALL') params.set('community', community)
    if (tab === 'COMMERCIAL') {
      params.set('type', 'Commercial')
    } else if (propertyType !== 'ALL') {
      params.set('type', propertyType)
    }
    if (budget !== 'ALL') params.set('budget', budget)

    const qs = params.toString()
    const target = tab === 'BUY' ? '/buy' : '/rent'
    router.push(qs ? `${target}?${qs}` : target)
  }

  return (
    <section className="ll-search-section" aria-label="Property Search">
      <div className="ll-container">
        <form onSubmit={handleSearch} className="ll-search-shell">
          <div className="ll-search-tabs-bar" role="tablist">
            {(['BUY', 'RENT', 'COMMERCIAL'] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tab === item}
                onClick={() => {
                  setTab(item)
                  setPropertyType(item === 'COMMERCIAL' ? 'Commercial' : 'ALL')
                  setBudget('ALL')
                }}
                className={`ll-search-tab ${tab === item ? 'active' : ''}`}
              >
                {item === 'BUY' ? 'Buy' : item === 'RENT' ? 'Rent' : 'Commercial'}
              </button>
            ))}
          </div>

          <div className="ll-search-panel">
            <div className="ll-search-grid">
              <div className="ll-search-field">
                <label htmlFor="hero-community" className="ll-field-label">
                  Location / Community
                </label>
                <div className="ll-select-wrap">
                  <MapPinIcon size={16} className="ll-field-icon" />
                  <select
                    id="hero-community"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="ll-select"
                  >
                    <option value="ALL">Downtown Dubai, Palm Jumeirah...</option>
                    <option value="Palm Jumeirah">Palm Jumeirah</option>
                    <option value="Downtown Dubai">Downtown Dubai</option>
                    <option value="Dubai Hills Estate">Dubai Hills Estate</option>
                    <option value="Dubai Marina">Dubai Marina</option>
                    <option value="Emirates Hills">Emirates Hills</option>
                    <option value="DIFC">DIFC</option>
                  </select>
                </div>
              </div>

              <div className="ll-search-field">
                <label htmlFor="hero-type" className="ll-field-label">
                  Property Type
                </label>
                <div className="ll-select-wrap">
                  <LayersIcon size={16} className="ll-field-icon" />
                  <select
                    id="hero-type"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="ll-select"
                  >
                    <option value="ALL">All property types</option>
                    <option value="Villa">Villa</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Duplex">Duplex</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div className="ll-search-field">
                <label htmlFor="hero-budget" className="ll-field-label">
                  Price Range (AED)
                </label>
                <div className="ll-select-wrap">
                  <CurrencyIcon size={16} className="ll-field-icon" />
                  <select
                    id="hero-budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="ll-select"
                  >
                    <option value="ALL">Min price – Max price</option>
                    {tab === 'BUY' ? (
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

              <button type="submit" className="ll-btn ll-btn-primary ll-search-submit">
                <span>Search Properties</span>
                <ArrowRightIcon size={15} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
