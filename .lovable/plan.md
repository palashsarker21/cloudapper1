# Plan - Fix GitHub to Supabase Migration Deployment

Fix the production database migration pipeline to ensure that schema changes in GitHub are automatically and safely applied to the production Supabase project.

## User Review Required

> [!IMPORTANT]
> The repository owner **MUST** manually configure the following secrets in GitHub for the deployment pipeline to work:
> 1. **GitHub Repository** -> **Settings** -> **Secrets and variables** -> **Actions**
> 2. Add `SUPABASE_ACCESS_TOKEN` (Generate at [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens))
> 3. Add `SUPABASE_DB_PASSWORD` (The password used when creating the Supabase project)

## Proposed Changes

### Infrastructure & CI/CD
- **Fixed `supabase/config.toml`**: Updated the `project_id` to the correct production reference: `jyidtbyigdfeevkzjphy`.
- **New Deployment Workflow**: Created `.github/workflows/supabase-deploy.yml` which:
  - Triggers on push to `main` when migration files change.
  - Links the project using the production ref.
  - Safely pushes pending migrations using `supabase db push`.
- **Hardened CI Workflow**: Retained the existing `supabase-ci.yml` for pull request linting.

### Frontend Fixes
- **Repaired `SocialLinks.tsx`**: Fixed a JSX transform error caused by an incorrectly passed prop in the custom Facebook SVG component.

### Documentation
- **Updated `README.md`**: Added a dedicated "Supabase Production Migration Deployment" section detailing the source of truth, security requirements, and safety protocols.

## Technical Details

- **Deployment Command**: Uses `supabase db push --password "$SUPABASE_DB_PASSWORD"`. This is non-destructive and only applies new migrations.
- **Safety**: The workflow will fail and stop if there is a migration history mismatch, preventing accidental data loss or schema corruption.
- **Secrets Management**: No secrets are hard-coded. Authentication is handled entirely through GitHub Actions secrets.
