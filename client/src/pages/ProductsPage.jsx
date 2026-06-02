import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Grid2X2, List } from 'lucide-react'
import ProductCard, { ProductCardSkeleton } from '../components/products/ProductCard'
import ProductFilters from '../components/products/ProductFilters'
import { useProducts } from '../hooks/useProducts'
import { CATEGORY_LABELS } from '../utils/formatters'
import { Modal } from '../components/common/SharedComponents'

const SORT_OPTIONS = [
  { label: 'Newest First',       value: 'newest'     },
  { label: 'Price: Low to High', value: 'price-asc'  },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Highest Rated',      value: 'rating'     },
  { label: 'Biggest Discount',   value: 'discount'   },
]
const LIMIT = 12

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput,  setSearchInput]  = useState(searchParams.get('search') || '')
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [gridCols,     setGridCols]     = useState(3)

  const filters = useMemo(() => ({
    category: searchParams.get('category') || '',
    brand:    searchParams.get('brand')    || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating:   searchParams.get('rating')   || '',
    inStock:  searchParams.get('inStock')  || '',
    sort:     searchParams.get('sort')     || 'newest',
    page:     searchParams.get('page')     || '1',
    search:   searchParams.get('search')   || '',
    limit:    String(LIMIT),
  }), [searchParams])

  const { products, loading, total, pages } = useProducts(filters)
  const page = Number(filters.page)

  useEffect(() => {
    const t = setTimeout(() => updateFilter('search', searchInput), 400)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const updateFilter = useCallback((key, value) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev)
      value ? p.set(key, value) : p.delete(key)
      if (key !== 'page') p.delete('page')
      return p
    })
  }, [setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchParams({})
    setSearchInput('')
  }, [setSearchParams])

  const activeCount = [
    filters.category, filters.brand, filters.minPrice,
    filters.maxPrice, filters.rating, filters.inStock,
  ].filter(Boolean).length

  const pageTitle = filters.category
    ? CATEGORY_LABELS[filters.category] || filters.category
    : 'All Products'

  const goPage = (p) => updateFilter('page', String(p))

  const pageNums = useMemo(() => {
    const total = Math.min(pages, 7)
    return Array.from({ length: total }, (_, i) => {
      if (pages <= 7) return i + 1
      if (page <= 4) return i + 1
      if (page >= pages - 3) return pages - 6 + i
      return page - 3 + i
    })
  }, [pages, page])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="section-wrapper py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-display font-bold text-2xl text-gray-900">{pageTitle}</h1>
              {!loading && (
                <p className="text-gray-400 text-sm mt-0.5">
                  {total} product{total !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="input-base pl-9 pr-8"
              />
              {searchInput && (
                <button onClick={() => { setSearchInput(''); updateFilter('search', '') }}
                        className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="section-wrapper py-6">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-card sticky top-24">
              <ProductFilters
                filters={filters}
                onChange={updateFilter}
                onClear={clearFilters}
                activeCount={activeCount}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-sm font-semibold text-gray-700
                             border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeCount > 0 && (
                    <span className="w-4 h-4 bg-primary-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </button>
                {filters.category && (
                  <FilterChip label={CATEGORY_LABELS[filters.category]} onRemove={() => updateFilter('category', '')} />
                )}
                {filters.brand && (
                  <FilterChip label={filters.brand} onRemove={() => updateFilter('brand', '')} />
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={filters.sort}
                  onChange={e => updateFilter('sort', e.target.value)}
                  className="input-base py-2 text-sm w-auto cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="hidden xl:flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  {[3, 4].map(n => (
                    <button key={n} onClick={() => setGridCols(n)}
                            className={`px-2.5 py-2 transition-colors ${gridCols === n ? 'bg-primary-50 text-primary-700' : 'text-gray-400 hover:bg-gray-50'}`}>
                      {n === 3 ? <Grid2X2 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-4`}>
                {Array.from({ length: LIMIT }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <EmptyState onClear={clearFilters} hasFilters={activeCount > 0 || !!filters.search} />
            ) : (
              <>
                <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-4`}>
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-10">
                    <PaginBtn onClick={() => goPage(page - 1)} disabled={page <= 1}><ChevronLeft className="w-4 h-4" /></PaginBtn>
                    {page > 4 && pages > 7 && <><PaginBtn onClick={() => goPage(1)}>1</PaginBtn><span className="text-gray-400 px-1">...</span></>}
                    {pageNums.map(n => <PaginBtn key={n} onClick={() => goPage(n)} active={n === page}>{n}</PaginBtn>)}
                    {page < pages - 3 && pages > 7 && <><span className="text-gray-400 px-1">...</span><PaginBtn onClick={() => goPage(pages)}>{pages}</PaginBtn></>}
                    <PaginBtn onClick={() => goPage(page + 1)} disabled={page >= pages}><ChevronRight className="w-4 h-4" /></PaginBtn>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter modal */}
      <Modal isOpen={filterOpen} onClose={() => setFilterOpen(false)} title="Filters" size="sm">
        <ProductFilters
          filters={filters}
          onChange={updateFilter}
          onClear={() => { clearFilters(); setFilterOpen(false) }}
          activeCount={activeCount}
        />
      </Modal>
    </div>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove}><X className="w-3 h-3" /></button>
    </span>
  )
}

function PaginBtn({ children, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled}
            className={`w-9 h-9 rounded-xl text-sm font-semibold flex items-center justify-center
                        transition-all disabled:opacity-30 disabled:cursor-not-allowed
                        ${active ? 'bg-primary-800 text-white shadow-btn' : 'text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
      {children}
    </button>
  )
}

function EmptyState({ onClear, hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="font-display font-bold text-lg text-gray-800 mb-2">No products found</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-xs">
        {hasFilters ? 'Try adjusting your filters or search terms.' : 'No products available right now.'}
      </p>
      {hasFilters && <button onClick={onClear} className="btn-secondary text-sm">Clear All Filters</button>}
    </div>
  )
}
