# Tanbir Hasan — Portfolio Website

A production-ready portfolio website for a Mechanical Design & Simulation Engineer.  
Built with **plain HTML, CSS, and vanilla JavaScript** — no frameworks, no build tools, no npm required.

---

## 🚀 Quick Start — Deploy to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it anything you like (e.g., `portfolio` or `tanbir-hasan.github.io`)
3. Set it to **Public**
4. **Do NOT** check "Add a README" or ".gitignore" (we already have them)
5. Click **Create repository**

> **Pro tip:** If you name it `<your-username>.github.io`, your site will be at `https://<your-username>.github.io` (no subpath).  
> If you name it anything else (e.g., `portfolio`), your site will be at `https://<your-username>.github.io/portfolio`.

### Step 2: Upload Files via Git (Recommended)

Open **PowerShell** or **Terminal** and run these commands one by one:

```powershell
# 1. Navigate to the portfolio folder
cd "c:\Users\Tanbir Hasan\OneDrive\Desktop\Portfolio\tanbir-hasan-portfolio\portfolio"

# 2. Initialize git
git init

# 3. Add all files
git add .

# 4. Create the first commit
git commit -m "Initial portfolio deployment"

# 5. Set the branch name to main
git branch -M main

# 6. Connect to your GitHub repository (replace with YOUR repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 7. Push everything
git push -u origin main
```

**Replace `YOUR_USERNAME` and `YOUR_REPO_NAME`** with your actual GitHub username and repository name.

### Step 2 (Alternative): Upload via GitHub Web UI

If you don't have Git installed:

1. Go to your new repository on GitHub
2. Click **"uploading an existing file"** link (or go to `Add file → Upload files`)
3. **Drag and drop the entire contents** of the `portfolio` folder (not the folder itself — the files *inside* it)
4. Make sure these files are at the **root** of the repository:
   - `index.html`
   - `css/` folder
   - `js/` folder
   - `content/` folder
   - `assets/` folder
   - All `.html` files
5. Click **Commit changes**

> ⚠️ **Important:** `index.html` must be at the ROOT of the repository, not inside a subfolder.

### Step 3: Enable GitHub Pages

1. Go to your repository → **Settings** → **Pages** (left sidebar)
2. Under **Source**, select **Deploy from a branch**
3. Under **Branch**, select `main` and folder `/` (root)
4. Click **Save**
5. Wait 1-2 minutes, then your site will be live at:
   - `https://YOUR_USERNAME.github.io` (if repo is named `username.github.io`)
   - `https://YOUR_USERNAME.github.io/REPO_NAME` (if repo is named something else)

---

## 📁 File Structure

```
portfolio/
├── index.html              ← Home page (hero, animations, featured work)
├── designs.html             ← 3D Designs gallery with filtering
├── simulations.html         ← CFD/FEA Simulations gallery
├── detail.html              ← Individual project detail page
├── skills.html              ← Skills & software proficiency
├── certifications.html      ← Badges & certificates
├── experience.html          ← Work experience & education timeline
├── contact.html             ← Contact information & email form
├── admin.html               ← CMS admin page (edit content via GitHub API)
├── 404.html                 ← Custom error page
├── robots.txt               ← SEO: search engine directives
├── sitemap.xml              ← SEO: sitemap for search engines
├── .nojekyll                ← Tells GitHub Pages to skip Jekyll processing
├── README.md                ← This file
│
├── css/
│   └── style.css            ← Complete design system & all styles
│
├── js/
│   ├── app.js               ← Core: navigation, data loading, utilities
│   ├── home.js              ← Hero animations (gear, drone CFD, FEA)
│   ├── gallery.js           ← Gallery filtering for designs/simulations
│   ├── detail.js            ← Project detail page rendering
│   ├── pages.js             ← Skills, certs, experience, contact pages
│   └── admin.js             ← CMS admin panel logic
│
├── content/
│   └── data.json            ← All portfolio content (edit this to update site)
│
└── assets/
    ├── images/              ← Project thumbnails, certificates, badges
    ├── videos/              ← Project demo videos (.mp4)
    ├── models/              ← 3D models (.glb for web viewer)
    └── reports/             ← PDFs: engineering drawings, reports
```

---

## ✏️ How to Update Your Portfolio Content

You have **three ways** to edit your portfolio content:

### Option A: Use the Built-in Admin Page (Easiest)

1. Go to `https://YOUR_SITE_URL/admin.html`
2. Enter your GitHub details:
   - **Username**: Your GitHub username
   - **Repository**: Your repository name
   - **Branch**: `main`
   - **Personal Access Token**: A fine-grained PAT (see below)
3. Edit any section — profile, designs, simulations, skills, experience, etc.
4. Upload images directly through the admin interface
5. Click **Save** — changes go live within minutes

#### How to Create a Personal Access Token (PAT)

1. Go to [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)
2. Click **Generate new token**
3. Name it: `Portfolio Admin`
4. Set expiration: 90 days (or custom)
5. Under **Repository access**, select **Only select repositories** → choose your portfolio repo
6. Under **Permissions → Repository permissions**:
   - **Contents**: Read and write
7. Click **Generate token**
8. **Copy the token** — you won't see it again!

> ⚠️ **Keep your token private.** Never share it or commit it to the repository. The admin page stores it only in your browser's session (not saved permanently).

### Option B: Edit `data.json` Directly

1. Go to your repository on GitHub
2. Navigate to `content/data.json`
3. Click the **pencil icon** (Edit this file)
4. Make your changes following the existing JSON structure
5. Click **Commit changes**

### Option C: Edit Locally and Push

1. Clone or pull the repo
2. Edit `content/data.json` in any text editor
3. Add images to `assets/images/`
4. Commit and push

---

## 📋 Content Guide — What to Put in `data.json`

### Profile Section
```json
{
  "profile": {
    "name": "Tanbir Hasan",
    "role": "Mechanical Design & Simulation Engineer",
    "tagline": "Precision-engineered 3D designs and validated simulations",
    "heroSubtitle": "A portfolio of precision-engineered 3D designs...",
    "email": "tanbirhasan.mail@gmail.com",
    "location": "Dhaka, Bangladesh"
  }
}
```

### Adding a New Design Project
```json
{
  "designs": [
    {
      "slug": "my-new-project",
      "title": "My New Project",
      "subtitle": "SOLIDWORKS Design",
      "thumbnail": "assets/images/my-project-thumb.jpg",
      "tags": ["solidworks", "mechanical"],
      "software": "SOLIDWORKS",
      "featured": true,
      "writeup": [
        {
          "heading": "Overview",
          "body": "Description of the project..."
        }
      ],
      "keyNumbers": [
        { "label": "Components", "value": "24" },
        { "label": "Weight", "value": "3.2 kg" }
      ],
      "images": [
        "assets/images/my-project-1.jpg",
        "assets/images/my-project-2.jpg"
      ],
      "video": "assets/videos/my-project-demo.mp4",
      "model3d": "assets/models/my-project.glb",
      "downloads": [
        {
          "label": "Engineering Drawing (PDF)",
          "url": "assets/reports/my-project-drawing.pdf"
        }
      ]
    }
  ]
}
```

### Adding a Simulation
Same structure as designs, but in the `"simulations"` array. Add `"type": "CFD"` or `"type": "FEA"`.

### Adding Badges & Certificates
```json
{
  "badges": [
    {
      "name": "CSWA",
      "issuer": "Dassault Systèmes",
      "image": "assets/images/cswa-badge.png"
    }
  ],
  "certificates": [
    {
      "name": "CSWA Certificate",
      "issuer": "Dassault Systèmes",
      "date": "2024-03-15",
      "image": "assets/images/cswa-cert.jpg"
    }
  ]
}
```

---

## 🖼️ Image Guidelines

| Type | Recommended Size | Format |
|------|-----------------|--------|
| Project thumbnails | 800×500 px | `.jpg` or `.webp` |
| Project gallery images | 1200×800 px | `.jpg` or `.webp` |
| Badge icons | 200×200 px | `.png` (transparent) |
| Certificate scans | 1200×900 px | `.jpg` |
| Profile photo | 400×400 px | `.jpg` |

- Keep image file sizes under **500 KB** each for fast loading
- Use descriptive filenames: `spur-gear-assembly.jpg`, not `IMG_2847.jpg`
- Place all images in `assets/images/`

---

## 🔧 Updating the Site After Changes

After making changes (either via admin page, direct JSON edit, or git push):

1. **Admin page**: Changes are pushed automatically — site updates in 1-2 minutes
2. **GitHub web edit**: Commit saves trigger a rebuild — site updates in 1-2 minutes
3. **Local git push**: Push your changes — site updates in 1-2 minutes

GitHub Pages automatically rebuilds when files change. No build commands needed.

---

## 🌐 Custom Domain (Optional)

If you buy a domain (e.g., `tanbirhasan.com`):

1. Go to your repository → **Settings** → **Pages**
2. Under **Custom domain**, type your domain name
3. Check **Enforce HTTPS**
4. Add DNS records at your domain registrar:
   - `A` record → `185.199.108.153`
   - `A` record → `185.199.109.153`
   - `A` record → `185.199.110.153`
   - `A` record → `185.199.111.153`
   - `CNAME` record → `YOUR_USERNAME.github.io`

---

## 📱 Features

- **Responsive** — looks great on desktop, tablet, and mobile
- **Three-scene hero animation** — rotating gear, drone CFD, and FEA stress cycling
- **Project galleries** — filterable by tag and software
- **Detail pages** — write-ups, image galleries, video player, 3D model viewer
- **Skills page** — animated progress bars grouped by category
- **Certifications** — badge wall and certificate cards with lightbox
- **Experience timeline** — work history and education
- **Contact page** — info panel with mailto form
- **Admin CMS** — edit content directly from your browser
- **SEO optimized** — meta tags, sitemap, semantic HTML
- **Accessible** — skip links, ARIA labels, keyboard navigation
- **Performance** — lazy loading, animation pause when off-screen, reduced motion support

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| Site shows 404 | Make sure `index.html` is at the repository ROOT, not inside a subfolder |
| Images not loading | Check that image paths in `data.json` match actual filenames in `assets/images/` |
| Admin page won't save | Verify your PAT has **Contents: Read and write** permission for the repository |
| Site not updating | Wait 2-3 minutes after push; check GitHub Pages settings; clear browser cache |
| Animations not showing | Check browser console for JS errors; ensure all JS files are uploaded |
| Navigation links broken | Make sure all `.html` files are at the repository root |

---

## 📜 License

This portfolio template is free to use and modify for personal use.

Built by Tanbir Hasan · [tanbirhasan.mail@gmail.com](mailto:tanbirhasan.mail@gmail.com)
