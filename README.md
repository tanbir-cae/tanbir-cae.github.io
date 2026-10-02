# Tanbir Hasan — Engineering Portfolio + Secure CMS

This is the public portfolio plus a secure cloud CMS foundation.

## Architecture
- Public site: GitHub Pages
- Admin UI: `/admin/`
- Authentication: Supabase Auth
- Admin security: TOTP MFA + Supabase Row Level Security
- Database: Supabase Postgres
- Files: Supabase Storage

## Manage without editing code
Use the Admin page to add:
- Projects
- Research
- Publications
- Certifications
- Awards
- Media
- Other content

Each item can include tags, dates, links and multiple files. Published content is loaded automatically by the public portfolio.

## First-time setup
Read `SETUP.md` and run `supabase/schema.sql` in your Supabase SQL Editor.

Do not commit `supabase-config.js` if it contains secrets. The browser key is not a service-role secret, but keeping configuration out of the repository makes accidental exposure less likely. Never put a service-role/secret key in frontend code.
