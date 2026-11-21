# DashStack — Angular Dashboard Portfolio Demo

A multi-page **Angular 19** dashboard demonstration using Angular Material, ECharts, Chart.js, and Lucide icons. This is a **sample-data UI project**, not a production SaaS application.

## What you can explore

- Main dashboard and analytics at `/dashboard` and `/analytics`.
- Separate analytics-insights page at `/analytics-insights` (the duplicated `/analytics` route was fixed).
- Financial, CRM, AI-themed, and ecommerce dashboard screens.
- Products, orders, inventory, users, calendar, to-do, inbox, favorites, pricing, and settings screens.
- Responsive sidebar, charts, and a demo profile visible in the top bar.
- **Demo Insights** on the orders page generate basic local order statistics; they do **not** call an AI model.

## Run locally

Prerequisites: Node.js 22 and npm. From the repository root:

```bash
npm ci
npm start
```

Open <http://localhost:3000>. All data and identities in this example are illustrative.

## Check and build

```bash
npm run typecheck  # TypeScript check
npm test           # Node source-integrity regression checks (not Angular UI tests)
npm run build      # Production Angular build
```

CI runs these commands on pull requests and pushes to `main`. Full component tests and end-to-end browser tests are still future work.

## Security and demo limitations

- There is **no real authentication**, account storage, or production backend. The user shown is `Demo User`; editing the profile updates the UI only until a page reload.
- The Settings security and notification controls are UI demonstrations and cannot change a password, enable MFA, or save notifications.
- Dashboard charts and records are sample or simulated data. Do not treat them as real-time business figures.
- The previous browser-side Gemini key usage has been replaced with local demo statistics. Do **not** put API secrets in frontend files or commit `.env` files. Real AI calls require a separate authenticated backend proxy.
- There is no live hosted demo provided by this repository; start it locally.

## Repository maintenance

`node_modules/`, build output, local `.env` files, and `.angular/` cache are ignored. Review and test changes before merging them.

## Project status

Portfolio prototype. Screens are present, but not all interface actions are backed by real persistence or services. Build status must be verified by CI or in a local checkout.
