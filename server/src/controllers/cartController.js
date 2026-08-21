import Cart from '../models/Cart.js'
import Product from '../models/Product.js'

const renderCart = async userId => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product').lean()
  const items = (cart?.items || []).filter(item => item.product?.isActive).map(item => ({ ...item.product, quantity: item.quantity }))
  return { items }
}

export const getCart = async (req, res) => res.json({ success: true, ...(await renderCart(req.user._id)) })

export const replaceCart = async (req, res) => {
  try {
    const rawItems = Array.isArray(req.body.items) ? req.body.items.slice(0, 100) : null
    if (!rawItems) return res.status(400).json({ success: false, message: 'Cart items must be an array.' })
    const quantities = new Map()
    for (const item of rawItems) {
      const id = String(item?.productId || '')
      const quantity = Number(item?.quantity)
      if (!id.match(/^[a-f\d]{24}$/i) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) return res.status(400).json({ success: false, message: 'Cart contains an invalid item.' })
      quantities.set(id, quantity)
    }
    const ids = [...quantities.keys()]
    const products = await Product.find({ _id: { $in: ids }, isActive: true }).select('_id stock').lean()
    if (products.length !== ids.length) return res.status(400).json({ success: false, message: 'One or more products are unavailable.' })
    const stock = new Map(products.map(product => [String(product._id), product.stock]))
    for (const [id, quantity] of quantities) if (stock.get(id) < quantity) return res.status(409).json({ success: false, message: 'Requested quantity is not available.' })
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: ids.map(id => ({ product: id, quantity: quantities.get(id) })) } }, { upsert: true, new: true, runValidators: true })
    res.json({ success: true, ...(await renderCart(req.user._id)) })
  } catch {
    res.status(400).json({ success: false, message: 'Could not save cart.' })
  }
}
