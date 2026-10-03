# Md. Tanbir Hasan - Portfolio Guide

Welcome to your production-ready Mechanical Engineering Portfolio! This document explains how to deploy your site and how to manage it using the built-in Content Management System (CMS).

## 1. How to Upload to GitHub

Since you have a lot of files (and a heavy `node_modules` folder that should not be uploaded), I have created a streamlined folder on your computer that contains **only** the necessary files for GitHub.

**Step-by-step to upload:**
1. Open your web browser and go to your new repository on GitHub.
2. Click the link that says **"uploading an existing file"** (it is usually right below the setup code block).
3. Open your computer's File Explorer and navigate to:
   `C:\Users\Tanbir Hasan\OneDrive\Desktop\Portfolio\tanbir-hasan-portfolio\github-upload`
4. **Select all files and folders inside the `github-upload` folder.**
5. **Drag and drop** them into the GitHub page in your browser.
6. Scroll down and click **"Commit changes"**.

*Note: The `github-upload` folder was specifically curated to exclude the heavy generated files, so GitHub will accept it immediately.*

---

## 2. How to Deploy to Vercel (For Free)

Once your code is on GitHub, deploying it to a live website is incredibly easy using Vercel.

1. Go to [vercel.com](https://vercel.com/) and click **Sign Up** (or Log In).
2. Choose **"Continue with GitHub"**.
3. Once logged in, click **"Add New..." -> "Project"**.
4. You will see a list of your GitHub repositories. Find your portfolio repository and click **"Import"**.
5. **Important:** Before clicking deploy, click on the **Environment Variables** dropdown.
6. Add the following keys (you can copy the values from the `.env.example` file in your code, or from your Supabase dashboard if you have set it up):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAIL_ALLOWLIST` (Set this to `tanbirhasan.mail@gmail.com`)
7. Click **"Deploy"**.
8. Wait 1-2 minutes. Vercel will give you a live link (e.g., `https://tanbir-hasan-portfolio.vercel.app`).

*(Note: If you don't add the Supabase keys right away, the site will still build successfully but will use the built-in offline mock data).*

---

## 3. How to Log in to the Admin CMS

Your portfolio features a secure Admin Content Management System (CMS) where you can add new projects, update your CV, and manage files.

1. **Go to the Admin Portal:** 
   Navigate to `/admin/login` on your live website (e.g., `https://your-site.vercel.app/admin/login`).
   *(There is also a discreet "Admin" link at the very bottom right of the footer).*
2. **Enter your Email:**
   Type your authorized email address: `tanbirhasan.mail@gmail.com`.
3. **Magic Link Login:**
   The system does not use passwords. Instead, click "Send Magic Link".
4. **Check your Email:**
   Open your Gmail inbox, find the email from Supabase/Vercel, and click the secure login link.
5. **Access Granted:**
   You will be instantly logged in and redirected to the `/admin/dashboard`.

*(Note: For this login to work in production, you must have your Supabase project created, the database schema applied using the SQL files in the `supabase` folder, and the Supabase environment variables added to Vercel).*

---

## 4. How to Maintain Your Portfolio

Once inside the Admin Dashboard, you can maintain your site without writing any code:

- **Case Studies (`/admin/projects`):** Create new engineering projects, upload CAD thumbnails, write rich text summaries, and categorize them (e.g., SolidWorks, CFD, FEA). You can save them as "Draft" while working, and toggle "Published" when ready.
- **Academic Research (`/admin/research`):** Add conference papers or working monographs.
- **Credentials (`/admin/credentials`):** Log new certificates (like CSWP, CSWE) so they appear on the homepage.
- **File Manager (`/admin/files`):** Upload your latest PDF CV or large CAD files (like `.sldasm` files) so recruiters can download them directly.

Happy engineering!
