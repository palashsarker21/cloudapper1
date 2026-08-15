# CloudApper — Production Marketplace Infrastructure

CloudApper is a premium AI Tools, Credits & Digital Products Marketplace built for high-scale, production-ready operations.

## 🚀 Quick Start (Production)

1. **Supabase Setup**:
   - Enable Auth (Email, Google).
   - Configure Storage Buckets: `digital-products` (Private), `public-assets` (Public).
   - Apply migrations: `supabase db push`.

2. **Environment Configuration**:
   - Copy `.env.example` to `.env`.
   - Configure **REQUIRED_CORE** variables (Supabase URL/Key).
   - Configure optional providers (Binance, Eklas, SMTP).

3. **Deployment**:
   - **Vercel**: Connect repository, add environment variables, and deploy from `main`.
   - **Supabase CI**: GitHub Actions automatically verify migrations on PRs.

## 🛠 Architecture

### Fault-Tolerant Fulfillment Engine
CloudApper uses a decoupled fulfillment state machine:
- **Payment Lifecycle**: `created` → `pending` → `under_review` → `paid`.
- **Fulfillment Lifecycle**: `pending` → `processing` → `completed` | `failed` | `pending_configuration`.

If an optional provider like **Eklas** is unconfigured, the system marks the fulfillment as `pending_configuration`. This prevents data loss and allows a Super Admin to retry fulfillment after providing the missing API key.

### Enterprise Security
- **RBAC**: Three-tier role system (`user`, `admin`, `super_admin`).
- **RLS**: Row-Level Security enabled on all sensitive tables.
- **Audit Logs**: Every administrative action is logged for compliance.

## 🔑 Environment Variables

### Public Variables (Client-Side)
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key |

### Server-Only Secrets (Private)
| Variable | Description |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Admin bypass key (Never expose to client) |
| `EKLAS_LICENSE_API_KEY` | License generation credentials |
| `BINANCE_PAY_API_KEY` | Binance Merchant API Key |
| `BINANCE_PAY_SECRET_KEY` | Binance Merchant Secret Key |
| `EMAIL_PROVIDER_API_KEY` | Resend/SendGrid API Key |

## 📦 Database & Migrations

GitHub is the authoritative source of truth for the CloudApper database schema.

### Supabase Production Migration Deployment

1. **Schema Location**: All migration files live in `supabase/migrations/`.
2. **Automated Deployment**: GitHub Actions automatically deploy pending migrations to the production Supabase project (`jyidtbyigdfeevkzjphy`) when changes are merged into the `main` branch.
3. **Safety First**:
   - **Never Reset Production**: The deployment pipeline uses `supabase db push`, which only applies new changes. It NEVER runs `db reset`.
   - **No Historical Edits**: Once a migration is applied to production, never edit the file. Create a new migration for any further changes.
   - **Conflict Detection**: If local and remote migration histories mismatch, the workflow will fail. Mismatches must be resolved manually via the Supabase CLI before the pipeline can continue.
4. **Required GitHub Secrets**:
   To enable automatic deployments, the repository owner must configure these secrets in **GitHub → Settings → Secrets and variables → Actions**:
   - `SUPABASE_ACCESS_TOKEN`: A personal access token generated from the Supabase Dashboard.
   - `SUPABASE_DB_PASSWORD`: The database password for the production project.
5. **Verification**:
   Successful deployments can be verified in the Supabase Dashboard under **Database → Migrations**.

### Creating a New Migration
To safely add a new schema change:
1. Create a new migration file in `supabase/migrations/` using the naming convention `YYYYMMDDHHMMSS_name.sql`.
2. Test locally if possible.
3. Commit and push to a feature branch.
4. Open a Pull Request (CI will lint the migration for destructive changes).
5. Merge to `main` to trigger the production deployment.


## 🏥 Health & Monitoring
Super Admins can monitor system health at `/super-admin/system/health`.
This dashboard provides real-time visibility into:
- Supabase Connection & Service Role status.
- External API availability (Binance, Eklas).
- Email delivery configuration.

## 💸 Payment Providers
1. **bKash/Nagad (Manual)**: Highly reliable, human-in-the-loop verification.
2. **Binance Pay (Automated)**: Instant fulfillment via cryptocurrency.
3. **Crypto Wallet (Manual)**: Blockchain transaction hash verification.

## 📄 License & Terms
CloudApper proprietary software. All rights reserved. 2026.
