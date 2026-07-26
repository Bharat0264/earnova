# Earnova Phase 2 Business MVP

## Implemented vertical slice

The protected `/app` workspace now supports a normalized multi-tenant business:

- Business creation and switching
- Owner, admin, editor, and viewer membership enforcement
- Customer profiles and lifetime recorded revenue
- Lead pipeline, follow-up dates, assignment fields, and lead-to-customer conversion
- Tenant-scoped inventory with server-side stock adjustments and reorder thresholds
- Manual sales with server-calculated discount, tax, totals, and transactional stock decrement
- Expenses with category, vendor, payment method, notes, receipt metadata, and recurring state
- Invoices with customer snapshots, calculated items, due dates, and payment states
- Period-based revenue, expense, profit, pipeline, invoice, customer, product, and inventory analytics
- Deterministic recommendations and a business assistant grounded only in authorized workspace metrics
- Previewed CSV import for customers, products/inventory, expenses, and single-product sales
- CSV templates, MIME/extension/size checks, required columns, duplicate handling, row errors, and import summaries
- Recent business activity records for important mutations

## Database changes

Phase 2 adds `Business`, `BusinessMember`, `BusinessCustomer`, `BusinessLead`, `BusinessProduct`, `BusinessSale`, `BusinessExpense`, `BusinessInvoice`, and `BusinessActivity`. All business-owned queries are scoped by an authorized business membership. Monetary values are stored as integer paise.

The legacy `BusinessWorkspace` collection is unchanged. This avoids destructive conversion of mixed legacy rows before their shape is reconciled.

## Validation performed

Run from the repository:

```powershell
cd server
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test

cd ..\client
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Lint currently completes with pre-existing warnings and no errors. The production build may need to run outside a restricted filesystem sandbox because Vite/esbuild resolves configuration above the client directory.

## Manual testing

1. Sign in and open `/app/overview`.
2. Create a business and confirm it appears in the header selector.
3. Add a customer, lead, and inventory product.
4. Record a sale and confirm product stock decreases and overview revenue changes.
5. Record an expense and confirm profit changes.
6. Create an invoice and mark it paid.
7. Move a lead to Won and confirm a customer record is created or reused.
8. Download a CSV template, preview a valid file, execute it, and inspect the row summary.
9. Ask the business assistant about profit, inventory, leads, or overdue invoices.
10. Sign in as a user without membership and confirm a copied business ID returns `403`.

## Remaining Phase 2 limitations

- Legacy mixed `BusinessWorkspace.orders` data is preserved but not automatically normalized.
- Excel `.xlsx` import and custom column mapping are not yet included; the current import path is validated CSV.
- CSV sales currently support one product per row rather than grouped multi-line orders.
- Invoice PDF generation, email delivery, and a dedicated print layout remain to be implemented.
- Purchases, vendors, payment records, inventory movement history, notifications, saved AI insight records, and advanced forecasting remain later Phase 2 slices.
- API integration tests currently cover safe operational endpoints plus unit-level tenant authorization and financial/import logic; a database-backed end-to-end business transaction test is still needed.
