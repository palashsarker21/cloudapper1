# CloudApper Infrastructure & Deployment Guide

This document serves as the authoritative guide for the production infrastructure, deployment workflow, and platform configurations for **CloudApper**.

## 1. Target Architecture

The CloudApper production lifecycle follows a clean separation of concerns across multiple platforms:

```text
Developer (Lovable)
   ↓
GitHub Repository (Source of Truth)
   ↓
Pull Request / Main Branch
   ↓
CI/CD Workflows
   ├── Supabase Migration Deployment (Database Schema)
   └── Vercel Application Deployment (Frontend/Backend Logic)
   ↓
Supabase (Backend Infrastructure)
   ├── PostgreSQL (Database)
   ├── Auth (User Management)
   ├── Storage (Digital Assets)
   ├── Realtime (Notifications)
   └── RLS (Security Layer)
   ↓
Vercel (Application Hosting)
   ├── Production Application
   ├── Preview Deployments
   └── Environment Variables
   ↓
Custom Domain (cloudapper.online)
   ↓
CloudApper Production
```

## 2. Platform Responsibilities

| Platform | Primary Purpose |
| :--- | :--- |
| **Lovable** | AI-assisted development, UI implementation, and rapid prototyping. Synchronizes code directly to GitHub. |
| **GitHub** | Version control, source code repository, pull requests, and the centralized source of truth for migrations and configuration. |
| **Supabase** | Managed PostgreSQL database, Authentication, Row Level Security, and secure Storage for digital assets. |
| **Vercel** | Production hosting, automated preview deployments, SSL management, and global edge distribution. |
| **Custom Domain** | Canonical production identity (`cloudapper.online`) providing HTTPS and trust for end-users. |

## 3. Source of Truth

**GitHub is the absolute source of truth** for:
- Application source code (React/TypeScript)
- Database migration files (`supabase/migrations/`)
- Supabase configuration (`supabase/config.toml`)
- Deployment workflows (GitHub Actions)
- Project documentation

**Critical Rules:**
- **Never** use the production Supabase SQL Editor for standard schema changes.
- **Never** make undocumented production schema changes.
- All database modifications **must** be represented by migration files in the repository.

## 4. Repository Structure

CloudApper follows a modern, full-stack React structure:

```text
/
├── .github/          # CI/CD Workflows (Supabase CI, Vercel Deployment)
├── public/           # Static assets (favicons, robots.txt)
├── src/
│   ├── components/   # Reusable UI (shadcn, marketplace)
│   ├── integrations/ # Auto-generated Supabase clients
│   ├── lib/          # Business logic & Server Functions
│   ├── routes/       # File-based routing (TanStack Router)
│   ├── styles.css    # Tailwind CSS v4 configuration
│   └── ...
├── supabase/
│   ├── migrations/   # SQL Schema history (Source of Truth)
│   └── config.toml   # Supabase project settings
├── package.json      # Dependencies and scripts
├── vite.config.ts    # Build configuration
└── README.md         # Production setup guide
```

## 5. Branch Strategy & Workflow

CloudApper uses a branch-based deployment strategy to ensure production stability.

*   **`main` Branch:** Represents the current production state. Only stable, reviewed code is merged here.
*   **`feature/*` Branches:** Used for active development.

**Recommended Workflow:**
1. Create a `feature/` branch for new changes.
2. Submit a **Pull Request (PR)** to `main`.
3. Vercel generates a **Preview Deployment** for testing.
4. Review and approve the PR.
5. Merge to `main` triggers **Production Deployment**.

*Note: Avoid deploying arbitrary feature branches directly to the production environment.*

## 6. Supabase Infrastructure

### Authentication
CloudApper uses Supabase Auth for secure user management.
- **Super Admin:** Authorized via the `super_admin` role in the `public.user_roles` table.
- **RBAC:** Access to `/super-admin` and `/admin` routes is restricted via server-side verification and RLS.
- **Identity:** `palashsarker1993@gmail.com` is the designated Super Admin.

### Row Level Security (RLS)
RLS is enabled on all sensitive tables to ensure data isolation.
- `orders` & `payments`: Users can only see their own records.
- `licenses` & `fulfillments`: Customers can only see their purchased items.
- `user_roles`: Read-only for authenticated users; write-restricted to Super Admins.
- `settings`: Sensitive payment settings are restricted to Super Admins.

### Database Migrations
Database schema changes are managed via versioned SQL files in `supabase/migrations/`.
- **Never edit an already-applied migration.**
- Create a new migration file for every subsequent change using the `YYYYMMDDHHMMSS_name.sql` format.

## 7. Vercel & Environment Variables

### Environment Separation
Configuration is managed through environment variables on Vercel.

**Public Variables (Client-side):**
- `VITE_SUPABASE_URL`: Supabase project endpoint.
- `VITE_SUPABASE_ANON_KEY`: Public anonymous API key.

**Server-side Secrets (Private):**
- `EKLAS_LICENSE_API_KEY`: API key for automated license generation.
- *Any payment gateway secrets (Binance, Webhooks, etc.)*

**Security Policy:**
- **Never** expose server-side secrets to the browser or client-side bundles.
- **Never** commit `.env` files containing real secrets to GitHub.

## 8. Custom Domain & DNS

**Canonical Domain:** `cloudapper.online`

### Configuration
1. **Vercel Settings:** Add the domain under `Project Settings -> Domains`.
2. **DNS Management:** Use the exact A and CNAME records provided by Vercel in your DNS provider (e.g., Namecheap, Cloudflare).
3. **SSL:** Vercel automatically provisions and renews SSL certificates once DNS is verified.

### Canonicalization
All traffic is redirected to the canonical `https://cloudapper.online` to ensure SEO consistency and secure OAuth/Payment callbacks.

## 9. Integration Flow: Payment to Fulfillment

CloudApper implements a hardened, idempotent fulfillment engine:

1. **Customer Submission:** Customer pays (bKash/Nagad) and submits a Transaction ID.
2. **Payment Review:** Status moves to `under_review`.
3. **Super Admin Verification:** Admin verifies the transaction in the Super Admin dashboard.
4. **License Generation:** Upon approval, the system calls the **Eklas License API** server-side.
5. **Entitlement:** The generated license is stored in the database and delivered to the customer's **Product Library**.

---

*This document was generated for CloudApper (2026). For technical issues, refer to the source code repository or Supabase/Vercel platform logs.*
