'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ResponsiveImg } from '@/components/ui/responsive-img'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, ImagesIcon } from '@/components/ui/icons'

/**
 * Property photos.
 * - Desktop: a mosaic (one large photo, two beside it; a "+N" tile when there are more).
 * - Phones: a swipe slider with a "1 / 3" counter.
 * Any photo opens the full-screen viewer (native <dialog>: focus trap and Esc for free),
 * with arrows, arrow keys and a thumbnail strip.
 * The project page keeps the older ImageGallery; this one is for property pages only.
 */
export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const [slide, setSlide] = useState(0)
  const [viewing, setViewing] = useState(0)
  const count = images.length
  const extra = count - 3

  const open = (index: number) => {
    setViewing(index)
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
      document.documentElement.classList.add('ll-pd-lock')
    }
  }

  const close = () => dialogRef.current?.close()

  const step = useCallback(
    (delta: number) => setViewing((current) => (current + delta + count) % count),
    [count],
  )

  // Keep the active thumbnail in view inside the viewer.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog?.open) return
    dialog
      .querySelector<HTMLElement>(`[data-thumb="${viewing}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [viewing])

  const onTrackScroll = () => {
    const track = trackRef.current
    if (!track || track.clientWidth === 0) return
    setSlide(Math.min(count - 1, Math.round(track.scrollLeft / track.clientWidth)))
  }

  const onDialogKey = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    }
  }

  if (count === 0) return null

  return (
    <div className="ll-pd-gallery" data-count={Math.min(count, 3)}>
      <ul
        ref={trackRef}
        className="ll-pd-gallery-track"
        onScroll={onTrackScroll}
        aria-label={`${title} photos`}
      >
        {images.map((src, index) => (
          <li key={src + index} className="ll-pd-gallery-tile">
            <button
              type="button"
              onClick={() => open(index)}
              aria-label={`Open photo ${index + 1} of ${count} full screen`}
            >
              <ResponsiveImg
                src={src}
                sizes={
                  index === 0
                    ? '(max-width: 760px) 100vw, (max-width: 1100px) 60vw, 820px'
                    : '(max-width: 760px) 100vw, 420px'
                }
                priority={index === 0}
                alt={`${title} — photo ${index + 1}`}
              />
              {index === 2 && extra > 0 && (
                <span className="ll-pd-gallery-more" aria-hidden="true">
                  +{extra}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {count > 1 && (
        <>
          <span className="ll-pd-gallery-count tabular-nums" aria-hidden="true">
            {slide + 1} / {count}
          </span>
          <button type="button" className="ll-pd-gallery-all" onClick={() => open(0)}>
            <ImagesIcon size={16} />
            <span>View all {count} photos</span>
          </button>
        </>
      )}

      <dialog
        ref={dialogRef}
        className="ll-pd-viewer"
        aria-label={`${title} photos`}
        onKeyDown={onDialogKey}
        onClose={() => document.documentElement.classList.remove('ll-pd-lock')}
        onClick={(event) => {
          if (event.target === event.currentTarget) close()
        }}
      >
        <div className="ll-pd-viewer-bar">
          <span className="ll-pd-viewer-title">{title}</span>
          <span className="ll-pd-viewer-count tabular-nums" aria-live="polite">
            {viewing + 1} / {count}
          </span>
          <button type="button" className="ll-pd-viewer-close" onClick={close} autoFocus>
            <CloseIcon size={18} />
            <span className="sr-only">Close photos</span>
          </button>
        </div>

        <div className="ll-pd-viewer-stage">
          <ResponsiveImg
            key={images[viewing]}
            src={images[viewing]}
            sizes="100vw"
            alt={`${title} — photo ${viewing + 1}`}
          />
          {count > 1 && (
            <>
              <button
                type="button"
                className="ll-pd-viewer-nav ll-pd-viewer-nav--prev"
                onClick={() => step(-1)}
              >
                <ChevronLeftIcon size={22} />
                <span className="sr-only">Previous photo</span>
              </button>
              <button
                type="button"
                className="ll-pd-viewer-nav ll-pd-viewer-nav--next"
                onClick={() => step(1)}
              >
                <ChevronRightIcon size={22} />
                <span className="sr-only">Next photo</span>
              </button>
            </>
          )}
        </div>

        {count > 1 && (
          <div className="ll-pd-viewer-thumbs" role="group" aria-label="Choose a photo">
            {images.map((src, index) => (
              <button
                key={src + index}
                type="button"
                data-thumb={index}
                className={index === viewing ? 'is-active' : undefined}
                aria-pressed={index === viewing}
                aria-label={`Photo ${index + 1}`}
                onClick={() => setViewing(index)}
              >
                <ResponsiveImg src={src} sizes="120px" alt="" />
              </button>
            ))}
          </div>
        )}
      </dialog>
    </div>
  )
}
