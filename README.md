# SmartPOS — Sales & Inventory Management

SmartPOS is a polished front-end point-of-sale and inventory management portfolio project for small retail businesses. The GitHub Pages edition is intentionally dependency-free and stores demo data in the browser, making the project easy to run, review, and deploy.

## Highlights

- Responsive dashboard with revenue, profit, transaction and inventory KPIs
- Interactive POS checkout with product search, barcode-ready lookup, discounts and multiple payment methods
- Hold and resume orders
- Automatic inventory deduction after checkout
- Inventory adjustment history with reasons and user attribution
- Product catalog with SKU, barcode, pricing, margin, reorder levels and archive/restore workflow
- Transaction history, printable receipts and auditable transaction voiding
- Customer records with purchase history metrics
- Supplier directory prepared for a future purchase-order module
- Sales reports for products, categories and payment methods
- CSV exports for products and transactions
- Business and receipt configuration
- Demo Admin / Cashier role views
- Local audit/activity log
- JSON demo-data backup and reset tools

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage
- No framework or build step required

## Run Locally

You can open `index.html` directly in a modern browser, or serve the folder locally:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

1. Push this project to a GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your main branch and `/ (root)`.
5. Save and wait for the Pages URL to become available.

## Demo Shortcuts

- Switch between **Admin Demo** and **Cashier Demo** from the top-right role selector.
- Press **Ctrl/Cmd + K** to jump to the POS product search.
- Use **Settings → Reset sample data** to restore the original dataset.

## Project Structure

```text
smartpos-portfolio/
├── index.html
├── README.md
├── .gitignore
└── assets/
    ├── css/
    │   └── styles.css
    └── js/
        └── app.js
```

## Architecture

See the [Architecture notes](docs/ARCHITECTURE.md) for the suggested production database model, API boundaries, security rules, and migration path.

## Production Upgrade Roadmap

This repository is a portfolio/demo edition. A real client deployment should move business data and authorization to a server.

Recommended next architecture:

```text
React / Next.js frontend
        ↓
Node.js + Express / NestJS API
        ↓
PostgreSQL
        ↓
Authentication + RBAC
```

Production milestones:

- Secure login with password hashing and session/JWT handling
- Server-side role-based authorization
- PostgreSQL database and migrations
- Purchase orders and stock receiving
- Returns and partial refunds
- Multi-branch inventory
- Real barcode-scanner workflow
- Thermal receipt printer support
- Automated backups
- API validation, tests and error logging
- Deployment using a managed frontend, API and database host

## Portfolio Note

SmartPOS was designed to demonstrate practical front-end architecture and retail workflows rather than only CRUD screens. Transaction actions affect inventory, voids restore stock with an audit trail, reports are derived from sales data, and business settings flow into receipts and currency formatting.

## License

Use this project for learning and portfolio purposes. Add the license you prefer before distributing it commercially.
