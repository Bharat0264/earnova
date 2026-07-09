/**
 * Chainable query builder for Mongoose queries.
 *
 * Usage:
 *   const features = new APIFeatures(Product.find({ isActive: true }), req.query)
 *     .filter()
 *     .search()
 *     .sort()
 *     .paginate()
 *
 *   const products = await features.query
 */
export class APIFeatures {
  constructor(query, queryString) {
    this.query       = query
    this.queryString = queryString
  }

  /** Map price[gte]=X style params to MongoDB operators */
  filter() {
    const obj = { ...this.queryString }
    const exclude = ['page', 'limit', 'sort', 'fields', 'search']
    exclude.forEach(k => delete obj[k])

    /* Remove empty string values */
    Object.keys(obj).forEach(k => {
      if (obj[k] === '') delete obj[k]
    })

    /* Convert gte|gt|lte|lt to $gte|$gt|$lte|$lt */
    let str = JSON.stringify(obj)
    str = str.replace(/\b(gte|gt|lte|lt)\b/g, m => `$${m}`)
    this.query = this.query.find(JSON.parse(str))
    return this
  }

  /** Full-text style search across name, brand, shortDesc */
  search() {
    if (this.queryString.search) {
      const re = new RegExp(this.queryString.search, 'i')
      this.query = this.query.find({
        $or: [{ name: re }, { brand: re }, { shortDesc: re }],
      })
    }
    return this
  }

  /** Sort by field(s); default newest first */
  sort() {
    if (this.queryString.sort) {
      const map = {
        'price-asc':  'price',
        'price-desc': '-price',
        'rating':     '-rating',
        'discount':   '-discount',
        'newest':     '-createdAt',
      }
      const sortBy = map[this.queryString.sort] || this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }
    return this
  }

  /** Limit fields returned (e.g. fields=name,price) */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v')
    }
    return this
  }

  /** Paginate results */
  paginate() {
    if (this.queryString.limit === 'all') {
      return this
    }

    const page  = Math.max(parseInt(this.queryString.page,  10) || 1,  1)
    const limit = Math.min(parseInt(this.queryString.limit, 10) || 12, 100)
    this.query  = this.query.skip((page - 1) * limit).limit(limit)
    return this
  }
}

/** Build a filter object from req.query for countDocuments() */
export function buildCountFilter(queryString) {
  const obj     = { isActive: true }
  const exclude = ['page', 'limit', 'sort', 'fields', 'search']

  Object.entries(queryString).forEach(([key, value]) => {
    if (exclude.includes(key)) return
    if (value === '' || value === undefined || value === null) return
    if (key === 'minPrice') { obj.price = { ...obj.price, $gte: Number(value) }; return }
    if (key === 'maxPrice') { obj.price = { ...obj.price, $lte: Number(value) }; return }
    if (key === 'rating')   { obj.rating = { $gte: Number(value) }; return }
    if (key === 'inStock')  { obj.stock  = { $gt: 0 }; return }
    obj[key] = value
  })

  if (queryString.search) {
    const re = new RegExp(queryString.search, 'i')
    obj.$or  = [{ name: re }, { brand: re }, { shortDesc: re }]
  }

  return obj
}
