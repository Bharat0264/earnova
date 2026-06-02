import { useState } from 'react'
import { ZoomIn, Zap } from 'lucide-react'
import { CATEGORY_PLACEHOLDER_BG } from '../../utils/formatters'

function Placeholder({ category }) {
  return (
    <div
      className={`w-full h-full bg-gradient-to-br
                  ${CATEGORY_PLACEHOLDER_BG[category] || 'from-gray-900 to-gray-800'}
                  flex items-center justify-center`}
    >
      <Zap className="w-16 h-16 text-white/20" />
    </div>
  )
}

/**
 * @param {{ images: string[], name: string, category: string }} props
 */
export default function ImageGallery({ images = [], name = '', category }) {
  const [selected, setSelected]   = useState(0)
  const [imgError, setImgError]   = useState(false)
  const [zoomed,   setZoomed]     = useState(false)

  const src = images[selected]
  const hasThumbs = images.length > 1

  return (
    <div className="flex flex-col gap-3">
      {/* ── Main image ── */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50
                   border border-gray-100 group cursor-zoom-in"
        onClick={() => src && !imgError && setZoomed(true)}
      >
        {src && !imgError ? (
          <>
            <img
              key={selected}
              src={src}
              alt={name}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
            <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full
                            flex items-center justify-center opacity-0 group-hover:opacity-100
                            transition-opacity shadow-sm">
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </div>
          </>
        ) : (
          <Placeholder category={category} />
        )}
      </div>

      {/* ── Thumbnails ── */}
      {hasThumbs && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => { setSelected(i); setImgError(false) }}
              className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                selected === i
                  ? 'border-primary-500 shadow-md scale-105'
                  : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <img
                src={img}
                alt={`${name} ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.opacity = '0.4' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Zoom modal ── */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <img
            src={src}
            alt={name}
            className="max-w-full max-h-full rounded-2xl object-contain"
            style={{ maxHeight: '90vh', maxWidth: '90vw' }}
          />
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full
                       text-white flex items-center justify-center hover:bg-white/30"
            onClick={() => setZoomed(false)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
