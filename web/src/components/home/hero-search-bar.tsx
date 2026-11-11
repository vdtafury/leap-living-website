'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRightIcon, BuildingIcon, MapPinIcon } from '@/components/ui/icons'

export function HeroSearchBar() {
  const router = useRouter()
  const [tab, setTab] = useState<'BUY' | 'RENT' | 'PROJECTS'>('BUY')
  const [community, setCommunity] = useState('ALL')
  const [propertyType, setPropertyType] = useState('ALL')
  const [budget, setBudget] = useState('ALL')

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (community !== 'ALL') params.set('community', community)
    if (propertyType !== 'ALL') params.set('type', propertyType)
    if (budget !== 'ALL') params.set('budget', budget)

    const qs = params.toString()
    const target = tab === 'BUY' ? '/buy' : tab === 'RENT' ? '/rent' : '/projects'
    router.push(qs ? `${target}?${qs}` : target)
  }

  return (
    <section className="ll-search-section" aria-label="Property & Project Search">
      <div className="ll-container">
        <form onSubmit={handleSearch} className="ll-search-card">
          <div className="ll-search-top">
            <div className="ll-search-tabs" role="tablist">
              {(['BUY', 'RENT', 'PROJECTS'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={tab === item}
                  onClick={() => {
                    setTab(item)
                    setPropertyType('ALL')
                    setBudget('ALL')
                  }}
                  className={`ll-search-tab ${tab === item ? 'active' : ''}`}
                >
                  {item === 'BUY' ? 'Buy' : item === 'RENT' ? 'Rent' : 'Projects'}
                </button>
              ))}
            </div>
            <span className="ll-search-hint">
              Direct access to curated Dubai residential, commercial, and development mandates
            </span>
          </div>

          <div className="ll-search-grid">
            <div>
              <label htmlFor="hero-community" className="ll-field-label">
                District / Community
              </label>
              <div className="ll-select-wrap">
                <MapPinIcon size={15} className="ll-field-icon" />
                <select
                  id="hero-community"
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  className="ll-select"
                >
                  <option value="ALL">All Prime Dubai Districts</option>
                  <option value="Palm Jumeirah">Palm Jumeirah</option>
                  <option value="Downtown Dubai">Downtown Dubai</option>
                  <option value="Dubai Hills Estate">Dubai Hills Estate</option>
                  <option value="Dubai Marina">Dubai Marina</option>
                  <option value="Emirates Hills">Emirates Hills</option>
                  <option value="DIFC">DIFC</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="hero-type" className="ll-field-label">
                {tab === 'PROJECTS' ? 'Development Segment' : 'Asset Category'}
              </label>
              <div className="ll-select-wrap">
                <BuildingIcon size={15} className="ll-field-icon" />
                <select
                  id="hero-type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="ll-select"
                >
                  <option value="ALL">
                    {tab === 'PROJECTS' ? 'All Developments' : 'All Property Types'}
                  </option>
                  {tab === 'PROJECTS' ? (
                    <>
                      <option value="Off-Plan">Off-Plan Launches</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="Handover 2026">Near Handover</option>
                    </>
                  ) : (
                    <>
                      <option value="Villa">Villa</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Duplex">Duplex</option>
                      <option value="Commercial">Commercial</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="hero-budget" className="ll-field-label">
                {tab === 'RENT' ? 'Annual Lease Budget' : 'Capital Allocation'}
              </label>
              <div className="ll-select-wrap">
                <select
                  id="hero-budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="ll-select"
                >
                  <option value="ALL">All Price Tiers</option>
                  {tab === 'RENT' ? (
                    <>
                      <option value="UNDER_1M">Up to AED 1,000,000 / yr</option>
                      <option value="OVER_1M">Above AED 1,000,000 / yr</option>
                    </>
                  ) : (
                    <>
                      <option value="UNDER_10M">Up to AED 10,000,000</option>
                      <option value="10M_15M">AED 10M – AED 15M</option>
                      <option value="OVER_15M">Above AED 15,000,000</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <button type="submit" className="ll-btn ll-btn-primary ll-search-submit">
              <span>
                {tab === 'BUY'
                  ? 'Explore Buy'
                  : tab === 'RENT'
                    ? 'Explore Rent'
                    : 'Explore Projects'}
              </span>
              <ArrowUpRightIcon size={15} />
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

