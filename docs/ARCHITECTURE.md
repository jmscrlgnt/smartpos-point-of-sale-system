# SmartPOS Architecture Notes

## Portfolio Edition

The repository currently runs as a dependency-free browser application so reviewers can open it immediately or deploy it to GitHub Pages. The app is separated into HTML, CSS, and JavaScript, with demo persistence in `localStorage`.

```text
index.html
   ↓
assets/css/styles.css
assets/js/app.js
   ↓
Browser state + localStorage
```

This edition demonstrates UI architecture, state transitions, retail workflows, validation, reporting, export, and role-aware views. It intentionally does **not** claim production-grade authentication or database security.

## Production Target

A client-ready release should use a server-authoritative architecture:

```text
React / Next.js UI
      ↓ HTTPS
REST API (Node.js + Express/NestJS)
      ↓
PostgreSQL
      ↓
Managed backups / observability
```

### Suggested backend modules

- Authentication
- Users and role-based access control
- Businesses / branches
- Products and categories
- Inventory movements
- Suppliers and purchase orders
- Customers
- Sales, sale items and payments
- Returns and refunds
- Audit logs
- Reporting

## Suggested relational model

```text
businesses
  ├─ users
  ├─ categories
  │   └─ products
  ├─ suppliers
  │   └─ purchase_orders
  │       └─ purchase_items
  ├─ customers
  └─ sales
      ├─ sale_items → products
      ├─ payments
      └─ returns
          └─ return_items

products
  └─ inventory_movements
```

## Core production rules

1. Never trust totals calculated only in the browser; recompute them on the server.
2. Use database transactions for checkout, stock deduction, voids and returns.
3. Store password hashes only; never store plain-text passwords.
4. Enforce permissions on the server, not merely by hiding UI controls.
5. Preserve immutable transaction history. Voids and returns should create auditable events instead of deleting sales.
6. Use decimal/numeric database types for currency.
7. Add unique constraints for SKU, barcode, transaction number and relevant business-scoped identifiers.
8. Record inventory through movement records so stock changes are traceable.
9. Validate every request with a schema library before database writes.
10. Add automated tests for checkout, insufficient stock, void restoration, discounts and role permissions.

## Recommended API shape

```text
POST   /api/auth/login
GET    /api/dashboard
GET    /api/products
POST   /api/products
PATCH  /api/products/:id
POST   /api/inventory/adjustments
GET    /api/inventory/movements
POST   /api/sales
GET    /api/sales
GET    /api/sales/:id
POST   /api/sales/:id/void
GET    /api/customers
POST   /api/customers
GET    /api/suppliers
POST   /api/purchase-orders
POST   /api/purchase-orders/:id/receive
GET    /api/reports/sales
```

## Suggested next milestone

Move this portfolio demo to a React + Node.js + PostgreSQL implementation while preserving the current user experience. Start with authentication, products, inventory movements and checkout before adding purchasing and returns.
