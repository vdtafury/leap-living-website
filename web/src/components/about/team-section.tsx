'use client'

import { useRef, useState } from 'react'
import { getResponsiveImage } from '@/components/ui/responsive-img'
import { ArrowRightIcon, CloseIcon, LinkedInIcon, MailIcon } from '@/components/ui/icons'
import type { TeamMember } from '@/data/content-defaults'
import { TEAM_ANCHOR } from '@/lib/anchors'
import { bioParagraphs, initials, mediaPhotoSources, visibleMembers } from '@/lib/team'

function photoSources(src: string): { src: string; srcSet?: string } {
  return mediaPhotoSources(src) ?? getResponsiveImage(src)
}

function Portrait({ member, sizes }: { member: TeamMember; sizes: string }) {
  if (!member.photo) {
    return (
      <span className="ll-team-monogram" aria-hidden="true">
        {initials(member.name)}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...photoSources(member.photo)} sizes={sizes} alt="" loading="lazy" decoding="async" />
  )
}

function ContactLinks({ member, large = false }: { member: TeamMember; large?: boolean }) {
  if (!member.email && !member.linkedin) return null
  return (
    <div className={`ll-team-links${large ? ' is-large' : ''}`}>
      {member.email && (
        <a href={`mailto:${member.email}`} aria-label={`Email ${member.name}`}>
          <MailIcon size={large ? 16 : 15} />
          {large && <span>{member.email}</span>}
        </a>
      )}
      {member.linkedin && (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} on LinkedIn`}
        >
          <LinkedInIcon size={large ? 16 : 15} />
          {large && <span>LinkedIn</span>}
        </a>
      )}
    </div>
  )
}

/**
 * About → Meet the Team (D-57). Content comes from the CMS (admin → Content → About page);
 * nothing renders until at least one named person is published.
 * Cards show the photo, name, title and the start of the bio; "Read bio" opens the full
 * profile in a native <dialog> (focus trap, Esc and focus return come with it).
 */
export function TeamSection({
  title,
  intro,
  members,
}: {
  title: string
  intro: string
  members: TeamMember[]
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const people = visibleMembers(members)
  if (people.length === 0) return null

  const open = (index: number) => {
    setActive(index)
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
      document.documentElement.classList.add('ll-pd-lock')
    }
  }
  const close = () => dialogRef.current?.close()
  const person = active === null ? null : people[active]

  return (
    <section id={TEAM_ANCHOR} className="ll-section-light ll-team" aria-labelledby="ll-team-title">
      <div className="ll-container">
        <div className="ll-team-head">
          <h2 id="ll-team-title" className="ll-serif-title ll-section-title">
            {title}
          </h2>
          {intro && <p className="ll-section-lead">{intro}</p>}
        </div>

        <ul className="ll-team-grid" data-count={Math.min(people.length, 4)}>
          {people.map((member, index) => (
            <li key={`${member.name}-${index}`} className="ll-team-card">
              <div className="ll-team-photo">
                <Portrait
                  member={member}
                  sizes="(max-width: 560px) 46vw, (max-width: 1100px) 31vw, 300px"
                />
              </div>
              <div className="ll-team-body">
                <h3 className="ll-team-name">{member.name}</h3>
                <p className="ll-team-role">{member.role}</p>
                {member.brn && <p className="ll-team-brn">BRN {member.brn}</p>}
                {member.bio && <p className="ll-team-excerpt">{bioParagraphs(member.bio)[0]}</p>}
                <div className="ll-team-foot">
                  {member.bio && (
                    <button
                      type="button"
                      className="ll-team-more"
                      onClick={() => open(index)}
                      aria-haspopup="dialog"
                    >
                      <span>Read bio</span>
                      <span className="sr-only"> of {member.name}</span>
                      <ArrowRightIcon size={14} />
                    </button>
                  )}
                  <ContactLinks member={member} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialogRef}
        className="ll-team-dialog"
        aria-labelledby="ll-team-dialog-name"
        onClose={() => document.documentElement.classList.remove('ll-pd-lock')}
        onClick={(event) => {
          // A click on the backdrop (the dialog box itself, outside the card) closes it.
          if (event.target === event.currentTarget) close()
        }}
      >
        {person && (
          <div className="ll-team-profile">
            <div className="ll-team-profile-photo">
              <Portrait member={person} sizes="(max-width: 760px) 100vw, 380px" />
            </div>
            <div className="ll-team-profile-body">
              <button
                type="button"
                className="ll-team-close"
                onClick={close}
                aria-label="Close profile"
                autoFocus
              >
                <CloseIcon size={18} />
              </button>
              <p className="ll-team-role">{person.role}</p>
              <h3 id="ll-team-dialog-name" className="ll-team-profile-name">
                {person.name}
              </h3>
              {person.brn && <p className="ll-team-brn">BRN {person.brn}</p>}
              <div className="ll-team-profile-bio">
                {bioParagraphs(person.bio).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              <ContactLinks member={person} large />
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}
