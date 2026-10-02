# Tanbir Hasan — Engineering Portfolio CMS

A GitHub Pages + Supabase portfolio with a secure admin area.

## Website structure

- `index.html` — main portfolio homepage
- `cad.html` — CAD archive
- `cfd.html` — CFD archive
- `fea.html` — FEA archive
- `robotics-projects.html` — Robotics & Projects archive
- `project.html` — shared individual project page
- `admin/` — secure Supabase Auth + MFA admin panel
- `credentials.html` — credential archive with category filters
- `credentials.js` — credential cards and full-screen certificate viewer
- `supabase/` — database/RLS setup

## Work archive

The homepage contains exactly four Work archive cards: CAD, CFD, FEA, and Robotics & Projects. Individual projects are loaded from Supabase.

## CAD 3D viewer

For browser viewing, upload a `.glb` or `.gltf` file in the Admin panel's **3D model** field. The individual project page uses Google's `<model-viewer>` component with rotate, zoom and pan controls. Original CAD files such as SLDPRT, SLDASM, STEP, IGES, STL, DWG, DXF, ZIP and similar files can be uploaded as engineering attachments for download.

## Credentials archive

The Credentials section on the homepage links to `credentials.html`. The archive supports Certifications, Memberships, Presentations, Awards and Training. Each published record appears as a flashcard. Clicking a flashcard opens its image or PDF in a full-screen viewer, with an option to open the original file.

The Admin panel supports dedicated Membership, Presentation and Training types. These are stored using the existing Supabase schema (`other` or `publication` plus the appropriate category), so no destructive database migration is required.

## Security

Only the Supabase publishable/anon key belongs in `supabase-config.js`. The file is intentionally included in the GitHub-ready package because the browser needs it. A publishable/anon key is designed for browser use when Row Level Security is configured correctly. Never put a `service_role` or secret key in GitHub. Database and Storage mutations require the admin role and MFA (`aal2`).

## Deploy

Upload the contents of this folder to the root of your GitHub Pages repository. Before deployment, configure `supabase-config.js` with your Supabase project URL and browser-safe publishable key. Do not upload a service-role/secret key.

## Database update

Run the included `supabase/schema.sql` in Supabase SQL Editor. It is designed to be rerunnable and adds the `file_role` and `sort_order` fields used by the archive uploader.


## Important: Homepage ↔ Supabase connection

The homepage loads published credentials, research, and media directly from Supabase. Before deploying, fill in `supabase-config.js` with your Supabase Project URL and **publishable/anon key**. Do not use a service-role/secret key.

The homepage includes the Supabase client scripts before `script.js`; without these scripts, CMS content cannot appear on the public website.
