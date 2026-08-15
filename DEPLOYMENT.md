# Production Infrastructure & Deployment

CloudApper is configured for a high-availability production environment using Lovable, GitHub, Supabase, and Vercel.

## Target Architecture

- **Frontend & API:** React 19 (TanStack Start) hosted on **Vercel**.
- **Database & Auth:** **Supabase** (PostgreSQL, RLS, Auth, Storage).
- **Automation:** **Eklas API** for license fulfillment.
- **CI/CD:** **GitHub Actions** for automated testing and deployment.

## CI/CD Workflow

The project uses GitHub Actions to automate the following:

### 1. Supabase CI (`supabase-ci.yml`)
- **Trigger:** Pull Requests modifying files in the `supabase/` directory.
- **Actions:**
  - Lints database migrations.
  - Verifies schema consistency using the Supabase CLI.

### 2. Vercel Deployment (`vercel-deploy.yml`)
- **Trigger:** Pushes to `main` (Production) and Pull Requests (Preview).
- **Actions:**
  - **Preview:** Automatically builds and deploys a preview environment for every PR.
  - **Production:** Automatically deploys to `cloudapper.online` when changes land on `main`.

## Required Secrets

To enable these workflows, add the following secrets to your GitHub Repository (**Settings > Secrets and variables > Actions**):

| Secret Name | Description | Source |
|-----------|-------------|--------|
| `VERCEL_TOKEN` | Vercel Personal Access Token | Vercel Dashboard |
| `VERCEL_ORG_ID` | Vercel Organization ID | `vercel project ls` |
| `VERCEL_PROJECT_ID` | Vercel Project ID | `vercel project ls` |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI Access Token | Supabase Account Settings |

## Production Environment Variables

Ensure these are set in the Vercel Dashboard:

- `VITE_SUPABASE_URL`: Your production Supabase URL.
- `VITE_SUPABASE_ANON_KEY`: Your production Supabase Anon Key.
- `EKLAS_LICENSE_API_KEY`: Private key for license automation.

## Deployment Strategy

1. **Feature Branch:** Develop changes on a new branch.
2. **Pull Request:** Open a PR to `main`. This triggers a Preview deployment.
3. **Review:** Verify the Preview URL.
4. **Merge:** Merging to `main` triggers the Production deployment.
