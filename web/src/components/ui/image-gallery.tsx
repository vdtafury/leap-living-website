'use client'

import { useState } from 'react'
import { ResponsiveImg } from '@/components/ui/responsive-img'

interface ImageGalleryProps {
  images: string[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex] ?? images[0]

  return (
    <div>
      <div className="ll-gallery-main">
        <ResponsiveImg
          src={activeImage}
          sizes="(max-width: 1000px) 100vw, 60vw"
          priority={activeIndex === 0}
          alt={`${title} — view ${activeIndex + 1}`}
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
              aria-pressed={activeIndex === idx}
              className={`ll-gallery-thumb ${activeIndex === idx ? 'active' : ''}`}
            >
              <ResponsiveImg src={src} sizes="160px" alt={`${title} thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
