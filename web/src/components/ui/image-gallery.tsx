'use client'

import { useState } from 'react'
import { ResponsiveImg } from '@/components/ui/responsive-img'

interface ImageGalleryProps {
  images: string[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const safeIndex = activeIndex < images.length ? activeIndex : 0
  const activeImage = images[safeIndex]
  if (!activeImage) return null

  return (
    <div>
      <div className="ll-gallery-main">
        <ResponsiveImg
          src={activeImage}
          sizes="(max-width: 1000px) 100vw, 60vw"
          priority={safeIndex === 0}
          alt={`${title} — view ${safeIndex + 1}`}
        />
      </div>

      {images.length > 1 && (
        <div className="ll-gallery-thumbs" role="group" aria-label={`${title} gallery thumbnails`}>
          {images.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1} of ${images.length}`}
              aria-pressed={safeIndex === idx}
              className={`ll-gallery-thumb ${safeIndex === idx ? 'active' : ''}`}
            >
              <ResponsiveImg src={src} sizes="160px" alt={`${title} thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
