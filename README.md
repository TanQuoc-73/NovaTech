<div align="center">
  <img src="./fe/public/NovaTech_daymode.png" alt="NovaTech Logo" width="200" />
  <h1>NovaTech</h1>
  <p>Modern E-Commerce Platform</p>
</div>

## Overview

NovaTech is a full-stack e-commerce platform built with a Next.js frontend and NestJS backend. It features a product catalog with advanced filtering, user authentication, shopping cart, checkout flow, order management, payment integration, and a comprehensive admin dashboard.

## Tech Stack

| Layer      | Technology                                                |
| ---------- | --------------------------------------------------------- |
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS v4         |
| Backend    | NestJS 11, TypeScript                                     |
| Database   | Supabase (PostgreSQL)                                     |
| Auth       | Supabase Auth + Row-Level Security                        |
| Charts     | Recharts                                                  |
| Icons      | Lucide React                                              |
| Email      | Nodemailer                                                |
| Package    | pnpm                                                      |

## Project Structure

```
NovaTech/
├── fe/                          # Frontend (Next.js)
│   └── src/
│       ├── app/                 # App Router pages
│       │   ├── admin/           # Admin dashboard pages
│       │   ├── products/        # Product listing & detail
│       │   ├── categories/      # Categories & brands
│       │   ├── news/            # News & articles
│       │   ├── warranty/        # Warranty & returns
│       │   └── cart/            # Shopping cart
│       ├── entities/            # Domain entities (product, order, etc.)
│       ├── features/            # Feature modules (auth, catalog, admin)
│       ├── shared/              # Shared utilities, UI, i18n
│       └── widgets/             # Composable widgets
├── be/                          # Backend (NestJS)
│   └── src/
│       ├── admin/               # Admin module
│       ├── admin-users/         # User management module
│       ├── auth/                # Authentication & authorization
│       ├── catalog/             # Products, categories, brands
│       ├── cart/                # Shopping cart
│       ├── checkout/            # Checkout flow
│       ├── orders/              # Order management
│       ├── payments/            # Payment integration
│       ├── staff/               # Staff management
│       ├── wishlist/            # Wishlist
│       └── infrastructure/      # Supabase client, shared services
└── supabase/
    └── migrations/              # Database migrations
```

## Features

### Customer-facing
- **Product Catalog** — Browse with search, filters (brand, category, price, stock), sorting, and pagination
- **Product Details** — Image gallery, variant selection, compare tool
- **Categories & Brands** — Browse by category with brand chips
- **Shopping Cart** — Add, remove, update quantities
- **Checkout** — Multi-step checkout with address and payment
- **Order Tracking** — View order history and status
- **News** — Company news and articles
- **Warranty & Returns** — Warranty policy information
- **Multi-language** — Vietnamese, English, Chinese support
- **Dark/Light Theme** — Persistent theme toggle

### Admin Dashboard
- **Overview** — Revenue chart, order status distribution, inventory bar chart
- **Catalog Management** — Products, variants, categories, brands (CRUD)
- **Order Management** — View and process orders
- **Payment Configuration** — QR code settings
- **Marketing** — Banners, news articles, vouchers
- **User Management** — Manage customers and staff with role assignment

## Getting Started

### Prerequisites

- Node.js 22.x
- pnpm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd NovaTech

# Install frontend dependencies
cd fe
pnpm install

# Install backend dependencies
cd ../be
pnpm install
```

### Environment Variables

**Frontend** (`fe/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

**Backend** (`be/.env`):
```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>
```

### Database

Run the Supabase migration to set up the initial schema:

```bash
supabase migration up
```

### Development

```bash
# Start backend (from be/)
pnpm start:dev

# Start frontend (from fe/)
pnpm dev
```

The frontend runs on `http://localhost:3000` and the API on `http://localhost:3001`.

### Production Build

```bash
# Build backend
cd be && pnpm build

# Build frontend
cd fe && pnpm build
```

## License

[MIT](LICENSE)
