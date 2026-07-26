import mongoose from 'mongoose'
import BusinessActivity from '../models/BusinessActivity.js'
import BusinessCustomer from '../models/BusinessCustomer.js'
import BusinessExpense from '../models/BusinessExpense.js'
import BusinessProduct from '../models/BusinessProduct.js'
import BusinessSale from '../models/BusinessSale.js'
import { calculateDocumentTotals, calculateLine } from '../services/businessAnalytics.js'
import { csvTemplate, parseCsv, validateCsvShape } from '../services/csvImport.js'
import { isValidEmail, isValidIndianPhone, normalizeEmail } from '../utils/validation.js'

const allowedPaymentMethods = ['cash', 'upi', 'card', 'bank_transfer', 'credit', 'other']
const allowedPaymentStatuses = ['pending', 'partial', 'paid']
const paise = value => Math.round(Number(value || 0) * 100)

const uploadedCsv = req => {
  if (!req.file?.buffer) throw new Error('Attach a CSV file.')
  const parsed = parseCsv(req.file.buffer.toString('utf8'))
  validateCsvShape(req.params.type, parsed)
  return parsed
}

export const previewBusinessImport = async (req, res) => {
  try {
    const parsed = uploadedCsv(req)
    res.json({ success: true, ...validateCsvShape(req.params.type, parsed) })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const downloadBusinessTemplate = (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="earnova-${req.params.type}-template.csv"`)
    res.send(csvTemplate(req.params.type))
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

const validateRows = (type, records) => {
  const valid = []
  const errors = []
  for (const record of records) {
    const row = record.values
    let message = ''
    if (type === 'customers') {
      if (row.name.length < 2) message = 'Customer name is required.'
      else if (row.email && !isValidEmail(row.email)) message = 'Email is invalid.'
      else if (!isValidIndianPhone(row.phone)) message = 'Indian mobile number is invalid.'
    } else if (type === 'products' || type === 'inventory') {
      if (!row.sku || !row.name) message = 'SKU and product name are required.'
      else if (![row.purchasePrice, row.sellingPrice].every(value => Number.isFinite(Number(value || 0)) && Number(value || 0) >= 0)) message = 'Prices must be positive numbers.'
      else if (![row.currentQuantity, row.reorderLevel].every(value => Number.isInteger(Number(value || 0)) && Number(value || 0) >= 0)) message = 'Stock values must be positive whole numbers.'
    } else if (type === 'expenses') {
      if (!row.category || !(Number(row.amount) > 0) || Number.isNaN(new Date(row.date).getTime())) message = 'Category, positive amount and valid date are required.'
      else if (row.paymentMethod && !allowedPaymentMethods.includes(row.paymentMethod)) message = 'Payment method is invalid.'
    } else if (type === 'sales') {
      if (!row.productSku || !Number.isInteger(Number(row.quantity)) || Number(row.quantity) <= 0 || Number.isNaN(new Date(row.date).getTime())) message = 'Product SKU, whole-number quantity and valid date are required.'
      else if (row.customerEmail && !isValidEmail(row.customerEmail)) message = 'Customer email is invalid.'
      else if (row.paymentStatus && !allowedPaymentStatuses.includes(row.paymentStatus)) message = 'Payment status is invalid.'
      else if (row.paymentMethod && !allowedPaymentMethods.includes(row.paymentMethod)) message = 'Payment method is invalid.'
      else if (![row.discount, row.taxRate].every(value => Number.isFinite(Number(value || 0)) && Number(value || 0) >= 0)) message = 'Discount and tax rate must be positive numbers.'
      else if (Number(row.taxRate || 0) > 100) message = 'Tax rate cannot exceed 100%.'
    }
    if (message) errors.push({ rowNumber: record.rowNumber, message })
    else valid.push(record)
  }
  return { valid, errors }
}

export const executeBusinessImport = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    const type = req.params.type
    const { records } = uploadedCsv(req)
    const { valid, errors } = validateRows(type, records)
    const imported = []
    let duplicatesSkipped = 0

    await session.withTransaction(async () => {
      if (type === 'customers') {
        for (const { values: row, rowNumber } of valid) {
          const email = normalizeEmail(row.email)
          const duplicate = (email || row.phone) && await BusinessCustomer.exists({
            business: req.business._id,
            $or: [...(email ? [{ email }] : []), ...(row.phone ? [{ phone: row.phone }] : [])],
          }).session(session)
          if (duplicate) {
            duplicatesSkipped += 1
            errors.push({ rowNumber, message: 'Duplicate customer skipped.' })
            continue
          }
          const [customer] = await BusinessCustomer.create([{
            business: req.business._id,
            name: row.name,
            email,
            phone: row.phone,
            company: row.company,
            address: row.address,
            notes: row.notes,
            createdBy: req.user._id,
          }], { session })
          imported.push(customer._id)
        }
      } else if (type === 'products' || type === 'inventory') {
        for (const { values: row, rowNumber } of valid) {
          const sku = row.sku.trim().toUpperCase()
          if (await BusinessProduct.exists({ business: req.business._id, sku }).session(session)) {
            duplicatesSkipped += 1
            errors.push({ rowNumber, message: 'Duplicate SKU skipped.' })
            continue
          }
          const [product] = await BusinessProduct.create([{
            business: req.business._id,
            sku,
            name: row.name,
            category: row.category,
            purchasePricePaise: paise(row.purchasePrice),
            sellingPricePaise: paise(row.sellingPrice),
            currentQuantity: Number(row.currentQuantity || 0),
            reorderLevel: Number(row.reorderLevel || 0),
            supplier: row.supplier,
            createdBy: req.user._id,
          }], { session })
          imported.push(product._id)
        }
      } else if (type === 'expenses') {
        const expenses = valid.map(({ values: row }) => ({
          business: req.business._id,
          category: row.category,
          amountPaise: paise(row.amount),
          vendor: row.vendor,
          expenseDate: new Date(row.date),
          paymentMethod: row.paymentMethod || 'cash',
          notes: row.notes,
          recurring: ['true', 'yes', '1'].includes(row.recurring.toLowerCase()),
          createdBy: req.user._id,
        }))
        if (expenses.length) imported.push(...(await BusinessExpense.insertMany(expenses, { session })).map(item => item._id))
      } else if (type === 'sales') {
        for (const { values: row, rowNumber } of valid) {
          const product = await BusinessProduct.findOne({
            business: req.business._id,
            sku: row.productSku.trim().toUpperCase(),
            active: true,
          }).session(session)
          const quantity = Number(row.quantity)
          if (!product || product.currentQuantity < quantity) {
            errors.push({ rowNumber, message: product ? 'Insufficient inventory.' : 'Product SKU not found.' })
            continue
          }
          const customer = row.customerEmail
            ? await BusinessCustomer.findOne({ business: req.business._id, email: normalizeEmail(row.customerEmail) }).session(session)
            : null
          if (row.customerEmail && !customer) {
            errors.push({ rowNumber, message: 'Customer email not found.' })
            continue
          }
          const line = {
            product: product._id,
            name: product.name,
            sku: product.sku,
            ...calculateLine({
              quantity,
              unitPricePaise: product.sellingPricePaise,
              discountPaise: paise(row.discount),
              taxRateBps: Math.round(Number(row.taxRate || 0) * 100),
              integerQuantity: true,
            }),
          }
          const totals = calculateDocumentTotals([line])
          const [sale] = await BusinessSale.create([{
            business: req.business._id,
            saleNumber: `IMP-${Date.now().toString(36).toUpperCase()}-${rowNumber}`,
            customer: customer?._id,
            customerName: customer?.name,
            items: [line],
            ...totals,
            paymentStatus: row.paymentStatus || 'paid',
            paymentMethod: row.paymentMethod || 'cash',
            saleDate: new Date(row.date),
            createdBy: req.user._id,
          }], { session })
          product.currentQuantity -= quantity
          await product.save({ session })
          if (customer) {
            customer.totalRevenuePaise += totals.totalPaise
            customer.orderCount += 1
            customer.lastActivityAt = new Date()
            await customer.save({ session })
          }
          imported.push(sale._id)
        }
      }

      if (!imported.length && valid.length) throw new Error('No rows could be imported.')
      if (imported.length) {
        await BusinessActivity.create([{
          business: req.business._id,
          actor: req.user._id,
          type: 'import.completed',
          entityType: 'Import',
          summary: `Imported ${imported.length} ${type} record(s) from CSV.`,
          metadata: { type, imported: imported.length, errors: errors.length, duplicatesSkipped },
        }], { session })
      }
    })

    res.status(201).json({
      success: true,
      summary: {
        totalRows: records.length,
        imported: imported.length,
        rejected: errors.length,
        duplicatesSkipped,
        errors: errors.slice(0, 100),
      },
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Could not import the CSV.' })
  } finally {
    await session.endSession()
  }
}
