'use client'

import { useMemo, useState } from 'react'
import type { ProjectItem } from '@/data/catalog'
import { ProjectCard } from '@/components/project/project-card'

interface ProjectListingBrowserProps {
  projects: ProjectItem[]
  initialCommunity?: string
  initialType?: string
}

export function ProjectListingBrowser({
  projects,
  initialCommunity = 'ALL',
  initialType = 'ALL',
}: ProjectListingBrowserProps) {
  const [community, setCommunity] = useState(initialCommunity)
  const [status, setStatus] = useState(initialType)
  const [developer, setDeveloper] = useState('ALL')

  const communities = useMemo(
    () => Array.from(new Set(projects.map((p) => p.community))).sort(),
    [projects],
  )
  const developers = useMemo(
    () => Array.from(new Set(projects.map((p) => p.developer))).sort(),
    [projects],
  )

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      if (community !== 'ALL' && !project.community.includes(community)) return false
      if (status !== 'ALL' && project.status !== status) return false
      if (developer !== 'ALL' && project.developer !== developer) return false
      return true
    })
  }, [projects, community, status, developer])

  const resetFilters = () => {
    setCommunity('ALL')
    setStatus('ALL')
    setDeveloper('ALL')
  }

  return (
    <div>
      <div
        className="ll-filter-bar"
        style={{ gridTemplateColumns: 'repeat(3, 1fr) auto' }}
      >
        <div>
          <label htmlFor="prj-community" className="ll-field-label">
            District / Community
          </label>
          <div className="ll-select-wrap">
            <select
              id="prj-community"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="ll-select"
            >
              <option value="ALL">All Dubai Districts</option>
              {communities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="prj-status" className="ll-field-label">
            Delivery Stage
          </label>
          <div className="ll-select-wrap">
            <select
              id="prj-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="ll-select"
            >
              <option value="ALL">All Stages</option>
              <option value="Off-Plan">Off-Plan</option>
              <option value="Under Construction">Under Construction</option>
              <option value="Handover 2026">Handover 2026</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="prj-dev" className="ll-field-label">
            Master Developer
          </label>
          <div className="ll-select-wrap">
            <select
              id="prj-dev"
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
              className="ll-select"
            >
              <option value="ALL">All Developers</option>
              {developers.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="button" onClick={resetFilters} className="ll-btn ll-btn-outline">
          Reset
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="ll-form-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>No Developments Match Your Criteria</h3>
          <p style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            Clear filters or enquire directly for off-market developer allocations.
          </p>
          <button type="button" onClick={resetFilters} className="ll-btn ll-btn-primary">
            Show All Developments
          </button>
        </div>
      ) : (
        <div className="ll-cards-grid">
          {filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

