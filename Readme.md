# 🎮 Steam Store Client & High-Performance Commerce Platform

A pixel-accurate replica of the **Steam Desktop Client & Storefront**, engineered with a high-performance **Go (Gin + GORM)** commerce backend, a **PostgreSQL** relational database, **Redis** caching, and an **AWS Terraform IaC** production infrastructure.

---

## 🏗 Architecture Overview

```
                            ┌────────────────────────────────────────┐
                            │    Frontend: Steam Client (React/Vite)  │
                            │       http://localhost:3000            │
                            └──────────────────┬─────────────────────┘
                                               │ /api reverse proxy
                                               ▼
                            ┌────────────────────────────────────────┐
                            │    Backend API: Go (Gin Engine)        │
                            │       http://localhost:8080            │
                            └────┬─────────────┬─────────────┬───────┘
                                 │             │             │
                    ┌────────────▼───┐  ┌──────▼──────┐  ┌───▼───────────┐
                    │   PostgreSQL   │  │    Redis    │  │  MinIO / S3   │
                    │ Core Commerce  │  │  Cache &    │  │  Media Assets │
                    │ & Game Library │  │  Sessions   │  │   & Covers    │
                    └────────────────┘  └─────────────┘  └───────────────┘
```

---

## ✨ Features

- **Pixel-Accurate Steam Client UI**: Steam dark-mode design system (`#1b2838`, `#0e141b`, `#66c0f4`), Motiva Sans typography, glowing badges, and authentic desktop styling.
- **100% Dynamic Data**: Zero hardcoded mock data in the frontend. All game metadata, system specs, media galleries, reviews, carts, and libraries are fetched in real-time from PostgreSQL via REST APIs.
- **Featured Hero Showcase**: Split-card carousel with responsive 2x2 thumbnail preview hover states, dynamic price tags, and discount calculations.
- **Dedicated Game Detail Pages**:
  - Cinema stage image viewer with multi-screenshot track.
  - Dynamic System Requirements Matrix (Windows / macOS / Linux tabs with Min & Rec CPU, GPU, RAM, OS, Storage).
  - Live Customer Reviews feed with positive/negative filters.
  - Interactive "Was this review helpful?" / "Funny" community voting.
  - Verified Steam owner review authoring.
- **Complete Shopping Cart & Wallet**:
  - Flyout cart modal with real-time subtotal, savings, and price calculation.
  - Quick Steam Wallet top-up (`+$25`, `+$50`, `+$100`).
  - Atomic checkout transaction in Go (`SELECT FOR UPDATE` wallet balance check, order generation, library entitlement, and cart clearance).
- **Personal Game Library**:
  - Sidebar collection navigation with real-time title search.
  - "▶ PLAY" launcher simulation with playtime counters, achievements, and cloud save states.
- **Automatic Database Seeder**: Automatically seeds rich AAA titles (*Cyberpunk 2077*, *Elden Ring*, *Black Myth: Wukong*, *Counter-Strike 2*, *Baldur's Gate 3*) and verified community reviews on startup.

---

## 🗄 Core Relational Schema (PostgreSQL)

All database tables are created automatically with the `steam_` prefix via GORM `AutoMigrate`:

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| `steam_users` | Account credentials & wallet balance | `id`, `email`, `username`, `password_hash`, `role`, `wallet_balance` |
| `steam_games` | Game catalog, media, and hardware specs | `id`, `title`, `slug`, `price`, `discount_percent`, `banner_url`, `screenshots`, `genres`, `min_*`, `rec_*` |
| `steam_reviews` | Community game reviews & voting | `id`, `game_id`, `user_id`, `author_name`, `is_recommended`, `playtime_hours`, `content`, `helpful_count`, `funny_count` |
| `steam_cart_items` | Active user cart items | `id`, `user_id`, `game_id`, `created_at` |
| `steam_orders` | Completed checkout orders | `id`, `user_id`, `order_number`, `total_amount`, `savings`, `status` |
| `steam_order_items`| Order line items | `id`, `order_id`, `game_id`, `price_paid` |
| `steam_user_games` | User-owned game library | `id`, `user_id`, `game_id`, `playtime_minutes`, `purchased_at` |
| `steam_wallet_transactions` | Deposit & purchase ledger | `id`, `user_id`, `amount`, `type`, `description`, `created_at` |

---

## 📁 Repository Structure

```
Steam-store/
├── backend-go/                     # Core Commerce & Store API (Go / Gin)
│   ├── cmd/server/main.go          # Application entrypoint & DB migration
│   ├── internal/
│   │   ├── auth/                   # JWT auth, user registration, profiles
│   │   ├── games/                  # Game catalog, reviews, specs, S3 upload
│   │   ├── orders/                 # Cart, wallet, atomic checkout, library
│   │   └── middleware/             # JWT auth & RBAC route protection
│   ├── pkg/
│   │   ├── database/               # PostgreSQL connection pool & auto-seeder
│   │   └── s3/                     # AWS S3 / MinIO asset upload client
│   └── Dockerfile                  # Multi-stage Go production container
│
├── frontend/                       # Steam Client Frontend (React / Vite)
│   ├── src/
│   │   ├── components/             # Header, Navigation, CartModal
│   │   ├── context/AuthContext.jsx # Global JWT session & wallet balance
│   │   ├── pages/
│   │   │   ├── store/              # StorePage, GameDetailPage & CSS
│   │   │   └── library/            # LibraryPage & desktop launcher UI
│   │   └── services/api.js         # Centralized API client (auth, games, cart, library)
│   └── vite.config.js              # Reverse proxy configuration (/api -> :8080)
│
├── infra/terraform/                # AWS Production IaC
│   ├── main.tf                     # Root Terraform composition
│   ├── variables.tf / outputs.tf   # Environment-wide variables & outputs
│   └── modules/                    # VPC, ALB, ECS, RDS, Redis, DocumentDB, S3, Security
│
├── ai-engine-py/                   # Python FastAPI Recommendation Engine
├── docker-compose.yml              # Local multi-container development orchestration
├── .env.example                    # Environment variable template
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Go 1.22+](https://go.dev/) (for running backend locally)
- [Node.js 18+](https://nodejs.org/) (for running frontend)

### 1. Configure Environment Variables
Copy the template to `.env`:
```powershell
cp .env.example .env
```

---

### Option A: Run Core Backend via Docker (Recommended)

Starts **PostgreSQL, Redis, and the Go Backend** in containers:
```powershell
# 1. Start core database, cache, and Go backend
docker compose up -d postgres redis backend-go

# 2. Start the Vite Frontend client
cd frontend
npm install
npm run dev
```

---

### Option B: Run Everything Locally (Without Docker)

#### Terminal 1 — Go Backend:
Ensure PostgreSQL is running locally on port `5432`, then:
```powershell
cd backend-go
go run cmd/server/main.go
```
> *Starts on `http://localhost:8080`. Auto-migrates tables and seeds games on launch.*

#### Terminal 2 — Frontend:
```powershell
cd frontend
npm install
npm run dev
```
> *Starts on `http://localhost:3000`.*

---

## 🔌 API Reference (Core Endpoints)

### Public Storefront & Games
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint |
| `GET` | `/api/v1/games` | Retrieve game catalog (supports `genre`, `search`, pagination) |
| `GET` | `/api/v1/games/featured` | Retrieve featured & recommended games |
| `GET` | `/api/v1/games/:idOrSlug` | Retrieve full game metadata and system specifications |
| `GET` | `/api/v1/games/:idOrSlug/reviews` | Retrieve player reviews (`?filter=all\|positive\|negative`) |
| `POST` | `/api/v1/games/:idOrSlug/reviews` | Create a verified player review *(Auth required)* |
| `POST` | `/api/v1/games/reviews/:reviewId/vote` | Vote review as helpful or funny |

### Authentication & Users
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new account (`email`, `username`, `password`) |
| `POST` | `/api/v1/auth/login` | Login and obtain JWT token |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile & wallet balance *(Auth required)* |

### Cart, Wallet & Checkout
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/cart` | View current user's shopping cart *(Auth required)* |
| `POST` | `/api/v1/cart/items` | Add game to shopping cart *(Auth required)* |
| `DELETE` | `/api/v1/cart/items/:gameId` | Remove item from cart *(Auth required)* |
| `POST` | `/api/v1/cart/checkout` | Atomic checkout with wallet balance deduction *(Auth required)* |
| `GET` | `/api/v1/wallet` | Check wallet balance & transaction history *(Auth required)* |
| `POST` | `/api/v1/wallet/deposit` | Top up Steam Wallet balance *(Auth required)* |
| `GET` | `/api/v1/library` | Get user-owned game library *(Auth required)* |

---

## 🏛 Infrastructure as Code (Terraform)

Production infrastructure is provisioned on AWS using modular Terraform in [`infra/terraform/`](file:///c:/Users/ayush/Git%20Repo/Archived/Steam-store/infra/terraform/):

- **VPC Module**: Multi-AZ VPC with Public and Private Subnets, Internet Gateway, and NAT Gateway.
- **Database Module**: AWS RDS PostgreSQL with automated snapshots, multi-AZ deployment, and KMS encryption.
- **Redis Module**: AWS ElastiCache Redis cluster for sessions and high-throughput caching.
- **S3 Assets Module**: S3 bucket with public read policies for game covers and CDN distribution.
- **ALB & ECS Modules**: Application Load Balancer routing to ECS Fargate container tasks.

To plan infrastructure:
```powershell
cd infra/terraform
terraform init
terraform plan
```

---

## 📄 License
MIT License. Built for educational, architecture, and portfolio demonstrations.
