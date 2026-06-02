import { useState } from 'react'
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import { BRANDS, CATEGORIES } from '../../data/mockProducts'
import { CATEGORY_LABELS, formatPrice } from '../../utils/formatters'

const STAR_OPTIONS = [
  { label: '4★ & above', value: '4' },
  { label: '3★ & above', value: '3' },
  { label: '2★ & above', value: '2' },
]

function FilterSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-sm font-semibold
                   text-gray-800 mb-3 hover:text-primary-700 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && children}
    </div>
  )
}

/**
 * @param {{
 *   filters: { category, brand, minPrice, maxPrice, rating, inStock },
 *   onChange: (key, value) => void,
 *   onClear: () => void,
 *   activeCount: number,
 *   className?: string,
 * }} props
 */
export default function ProductFilters({ filters, onChange, onClear, activeCount, className = '' }) {
  const [priceMin, setPriceMin] = useState(filters.minPrice || '')
  const [priceMax, setPriceMax] = useState(filters.maxPrice || '')

  const applyPrice = () => {
    onChange('minPrice', priceMin)
    onChange('maxPrice', priceMax)
  }

  return (
    <div className={`bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-600" />
          <h2 className="font-display font-bold text-gray-900">Filters</h2>
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-primary-700 text-white text-[10px] font-bold
                             rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* ── Category ── */}
      <FilterSection title="Category">
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => onChange('category', '')}
              className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                !filters.category
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Products
            </button>
          </li>
          {CATEGORIES.map(cat => (
            <li key={cat}>
              <button
                onClick={() => onChange('category', filters.category === cat ? '' : cat)}
                className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                  filters.category === cat
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* ── Price range ── */}
      <FilterSection title="Price Range">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="input-base py-2 text-xs"
          />
          <span className="text-gray-400 shrink-0">–</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="input-base py-2 text-xs"
          />
        </div>
        <button
          onClick={applyPrice}
          className="w-full py-2 text-xs font-semibold bg-primary-50 text-primary-700
                     rounded-lg hover:bg-primary-100 transition-colors"
        >
          Apply Price Filter
        </button>
        {(filters.minPrice || filters.maxPrice) && (
          <p className="text-[11px] text-primary-600 mt-1.5 font-medium">
            {filters.minPrice ? formatPrice(filters.minPrice) : '₹0'} –{' '}
            {filters.maxPrice ? formatPrice(filters.maxPrice) : 'Any'}
          </p>
        )}
      </FilterSection>

      {/* ── Brand ── */}
      <FilterSection title="Brand">
        <ul className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
          {BRANDS.map(brand => (
            <li key={brand}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.brand === brand}
                  onChange={() => onChange('brand', filters.brand === brand ? '' : brand)}
                  className="w-3.5 h-3.5 rounded accent-primary-700 cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {brand}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* ── Star rating ── */}
      <FilterSection title="Star Rating">
        <ul className="space-y-1.5">
          {STAR_OPTIONS.map(opt => (
            <li key={opt.value}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === opt.value}
                  onChange={() => onChange('rating', filters.rating === opt.value ? '' : opt.value)}
                  className="accent-primary-700 cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                  {opt.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* ── In stock ── */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">In Stock Only</span>
        <button
          onClick={() => onChange('inStock', filters.inStock ? '' : 'true')}
          className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${
            filters.inStock ? 'bg-primary-700' : 'bg-gray-200'
          }`}
          style={{ height: '22px' }}
          role="switch"
          aria-checked={!!filters.inStock}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm
                        transition-transform duration-200 ${
                          filters.inStock ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`}
          />
        </button>
      </div>
    </div>
  )
}
