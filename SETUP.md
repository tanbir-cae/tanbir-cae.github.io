# Tanbir Hasan Portfolio — Secure CMS Setup

This package keeps the public portfolio on GitHub Pages and uses Supabase for the private admin system, database, authentication, MFA and file storage.

## 1. Create a Supabase project
Create a project at https://supabase.com/.

## 2. Create the database and storage rules
Open **SQL Editor** in Supabase and run the complete file:

`supabase/schema.sql`

## 3. Create your admin user
In Supabase Dashboard → Authentication → Users, create your own user with email/password.

Then make the account an admin by setting either:
- user metadata: `{ "admin": true }`, or
- app metadata: `{ "role": "admin" }`

Use app metadata if you want the role to be harder for a user to alter themselves.

## 4. Turn on MFA
For the admin account, enroll a TOTP authenticator (Google Authenticator, Authy, 1Password, etc.). The CMS requires an `aal2` session before management actions are accepted.

## 5. Configure the browser client
Copy the values from Supabase Dashboard → Project Settings → API into `supabase-config.js`.

Only use the browser-safe publishable/anon key. **Never** use the service_role/secret key in this repository.

## 6. Test locally
Because this is a static site, serve the folder with any local static server rather than opening `index.html` directly. Example with Python:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000/`

Admin:

`http://localhost:8000/admin/`

## 7. GitHub Pages
Push the portfolio folder to your public GitHub repository and enable GitHub Pages from the repository's Settings → Pages.

## Security model
- Public visitors can read only rows where `published = true`.
- Only the authenticated admin can create/update/delete content.
- Database management operations require MFA (`aal2`).
- Public file bucket is readable by visitors but writable only by MFA-authenticated users.
- Private file bucket requires MFA authentication.
- No service-role key is used in browser code.

## Important
The current CMS is intentionally a simple first production foundation. Before uploading highly sensitive/private documents, keep them in the private bucket and add a dedicated download flow using short-lived signed URLs. Public portfolio files should be treated as public once published.
