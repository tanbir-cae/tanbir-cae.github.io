/* ============================================================
   ADMIN.JS — GitHub API-based CMS for portfolio management
   No backend required: edits content/data.json via GitHub REST API
   ============================================================ */
(function () {
  'use strict';

  var P = window.Portfolio;
  var root = document.getElementById('admin-root');
  if (!root) return;

  /* ---------- State ---------- */
  var state = {
    connected: false,
    username: '',
    repo: '',
    branch: 'main',
    token: '',
    data: null,
    dataSha: '',  // SHA of content/data.json for conflict-safe updates
    saving: false,
    currentSection: 'profile'
  };

  /* ---------- LocalStorage helpers ---------- */
  var STORAGE_KEY = 'portfolio_admin_creds';

  function saveCredentials() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        username: state.username,
        repo: state.repo,
        branch: state.branch,
        token: state.token
      }));
    } catch (e) { /* silent */ }
  }

  function loadCredentials() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* silent */ }
    return null;
  }

  function clearCredentials() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* silent */ }
  }

  /* ---------- GitHub API helpers ---------- */
  var API = 'https://api.github.com';

  function ghFetch(path, opts) {
    opts = opts || {};
    var headers = {
      'Authorization': 'Bearer ' + state.token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (opts.body) headers['Content-Type'] = 'application/json';
    return fetch(API + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (res) {
      if (res.status === 401) throw new Error('Invalid token or token expired. Check your personal access token.');
      if (res.status === 403) throw new Error('Permission denied. Ensure your token has "Contents: read and write" permission for this repository.');
      if (res.status === 404) throw new Error('Repository not found. Check username and repository name.');
      if (res.status === 409) throw new Error('Conflict: the file was modified by someone else. Refresh and try again.');
      if (res.status === 422) throw new Error('Validation error. The file may be too large or the content is invalid.');
      return res;
    });
  }

  /* Fetch data.json content and SHA */
  function fetchDataJson() {
    return ghFetch('/repos/' + state.username + '/' + state.repo + '/contents/content/data.json?ref=' + state.branch)
      .then(function (res) {
        if (!res.ok) {
          if (res.status === 404) {
            // data.json doesn't exist yet — create from template
            return null;
          }
          throw new Error('Failed to fetch data.json: ' + res.status);
        }
        return res.json();
      })
      .then(function (file) {
        if (!file) {
          state.dataSha = '';
          return getDefaultData();
        }
        state.dataSha = file.sha;
        var content = atob(file.content.replace(/\n/g, ''));
        // Handle UTF-8 properly
        var bytes = new Uint8Array(content.length);
        for (var i = 0; i < content.length; i++) bytes[i] = content.charCodeAt(i);
        var decoded = new TextDecoder('utf-8').decode(bytes);
        return JSON.parse(decoded);
      });
  }

  function getDefaultData() {
    return {
      profile: { name: '', role: '', tagline: '', bio: '', location: '', email: '', heroSubtitle: '', aboutSections: [] },
      links: { linkedin: '', grabcad: '', github: '', resume: '' },
      skills: [], designs: [], simulations: [], badges: [], certificates: [],
      experience: [], education: [],
      meta: { siteTitle: '', siteDescription: '', ogImage: '', version: '1.0.0', lastUpdated: '' }
    };
  }

  /* Save data.json */
  function saveDataJson(message) {
    if (state.saving) return Promise.reject(new Error('Already saving...'));
    state.saving = true;
    showStatus('Saving...', 'info');

    // Update timestamp
    state.data.meta = state.data.meta || {};
    state.data.meta.lastUpdated = new Date().toISOString();

    var content = JSON.stringify(state.data, null, 2);
    // Encode to base64 (handle UTF-8)
    var encoder = new TextEncoder();
    var bytes = encoder.encode(content);
    var binary = '';
    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    var base64 = btoa(binary);

    var body = {
      message: message || 'Update portfolio content via admin',
      content: base64,
      branch: state.branch
    };
    if (state.dataSha) body.sha = state.dataSha;

    return ghFetch('/repos/' + state.username + '/' + state.repo + '/contents/content/data.json', {
      method: 'PUT',
      body: body
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Save failed: ' + res.status);
      return res.json();
    })
    .then(function (result) {
      state.dataSha = result.content.sha;
      state.saving = false;
      showStatus('Saved successfully! The site updates in about a minute.', 'success');
    })
    .catch(function (err) {
      state.saving = false;
      showStatus('Save failed: ' + err.message, 'error');
      throw err;
    });
  }

  /* Upload a file to assets/ */
  function uploadFile(file, folder) {
    return new Promise(function (resolve, reject) {
      if (file.size > 90 * 1024 * 1024) {
        reject(new Error('File is too large (>90 MB). GitHub blocks files above 100 MB.'));
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        if (!confirm('This file is over 50 MB (' + (file.size / 1024 / 1024).toFixed(1) + ' MB). Large files may be slow to upload. Continue?')) {
          reject(new Error('Upload cancelled.'));
          return;
        }
      }

      var ext = file.name.split('.').pop().toLowerCase();
      var timestamp = Date.now();
      var random = Math.random().toString(36).substring(2, 8);
      var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_');
      var fileName = timestamp + '_' + random + '_' + safeName;
      var path = 'assets/' + (folder || 'images') + '/' + fileName;

      // Should we resize the image?
      var isImage = ['jpg', 'jpeg', 'png', 'webp'].indexOf(ext) !== -1;
      var processFile = isImage ? resizeImage(file, 1800) : Promise.resolve(file);

      processFile.then(function (processedFile) {
        return readFileAsBase64(processedFile);
      }).then(function (base64) {
        return ghFetch('/repos/' + state.username + '/' + state.repo + '/contents/' + path, {
          method: 'PUT',
          body: {
            message: 'Upload ' + fileName + ' via admin',
            content: base64,
            branch: state.branch
          }
        });
      }).then(function (res) {
        if (!res.ok) throw new Error('Upload failed: ' + res.status);
        return res.json();
      }).then(function () {
        resolve(path);
      }).catch(reject);
    });
  }

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* Resize image to max dimension */
  function resizeImage(file, maxDim) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        if (img.width <= maxDim && img.height <= maxDim) {
          resolve(file);
          return;
        }
        var ratio = Math.min(maxDim / img.width, maxDim / img.height);
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        var ext = file.name.split('.').pop().toLowerCase();
        var mime = ext === 'png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(function (blob) {
          resolve(new File([blob], file.name, { type: mime }));
        }, mime, 0.85);
      };
      img.onerror = function () { resolve(file); };
      img.src = URL.createObjectURL(file);
    });
  }

  /* ---------- UI Helpers ---------- */
  function esc(str) { return P.escHtml(str); }

  function showStatus(msg, type) {
    var el = document.getElementById('admin-status');
    if (el) {
      el.className = 'admin-status admin-status--' + (type || 'info');
      el.textContent = msg;
      el.style.display = 'block';
      if (type === 'success') {
        setTimeout(function () { el.style.display = 'none'; }, 5000);
      }
    }
  }

  function generateId(prefix) {
    return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  }

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  /* ---------- Render Login ---------- */
  function renderLogin() {
    var saved = loadCredentials();
    root.innerHTML =
      '<div class="admin-login">' +
        '<h2>🔐 Connect to GitHub Repository</h2>' +
        '<p style="color:var(--muted);font-size:0.875rem;margin-bottom:1.5rem;">Enter your GitHub details to manage portfolio content. Your token is never stored on any server.</p>' +
        '<div id="admin-status" class="admin-status" style="display:none;"></div>' +
        '<div class="admin-field">' +
          '<label for="gh-username">GitHub Username</label>' +
          '<input type="text" id="gh-username" value="' + esc(saved ? saved.username : '') + '" placeholder="e.g., tanbir-cae">' +
        '</div>' +
        '<div class="admin-field">' +
          '<label for="gh-repo">Repository Name</label>' +
          '<input type="text" id="gh-repo" value="' + esc(saved ? saved.repo : '') + '" placeholder="e.g., tanbir-cae.github.io">' +
        '</div>' +
        '<div class="admin-field">' +
          '<label for="gh-branch">Branch</label>' +
          '<input type="text" id="gh-branch" value="' + esc(saved ? saved.branch : 'main') + '" placeholder="main">' +
        '</div>' +
        '<div class="admin-field">' +
          '<label for="gh-token">Personal Access Token</label>' +
          '<input type="password" id="gh-token" value="' + esc(saved ? saved.token : '') + '" placeholder="github_pat_...">' +
          '<p class="admin-field__help">Fine-grained token with <strong>Contents: read & write</strong> for this repository only.</p>' +
        '</div>' +
        '<div class="admin-field" style="display:flex;align-items:center;gap:0.5rem;">' +
          '<input type="checkbox" id="gh-remember"' + (saved ? ' checked' : '') + '>' +
          '<label for="gh-remember" style="margin-bottom:0;">Remember on this device</label>' +
        '</div>' +
        '<button class="btn btn--primary" id="connect-btn" style="width:100%;margin-top:1rem;">Connect →</button>' +
      '</div>';

    document.getElementById('connect-btn').addEventListener('click', doConnect);
    // Enter key
    ['gh-username', 'gh-repo', 'gh-branch', 'gh-token'].forEach(function (id) {
      document.getElementById(id).addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doConnect();
      });
    });
  }

  function doConnect() {
    state.username = document.getElementById('gh-username').value.trim();
    state.repo = document.getElementById('gh-repo').value.trim();
    state.branch = document.getElementById('gh-branch').value.trim() || 'main';
    state.token = document.getElementById('gh-token').value.trim();

    if (!state.username || !state.repo || !state.token) {
      showStatus('Please fill in all fields.', 'warning');
      return;
    }

    var btn = document.getElementById('connect-btn');
    btn.textContent = 'Connecting...';
    btn.disabled = true;

    // Verify credentials
    ghFetch('/repos/' + state.username + '/' + state.repo)
      .then(function (res) {
        if (!res.ok) throw new Error('Repository check failed.');
        return res.json();
      })
      .then(function () {
        return fetchDataJson();
      })
      .then(function (data) {
        state.data = data;
        state.connected = true;

        if (document.getElementById('gh-remember').checked) {
          saveCredentials();
        } else {
          clearCredentials();
        }

        document.getElementById('logout-btn').style.display = '';
        renderDashboard();
      })
      .catch(function (err) {
        btn.textContent = 'Connect →';
        btn.disabled = false;
        showStatus(err.message, 'error');
      });
  }

  /* ---------- Logout ---------- */
  document.getElementById('logout-btn').addEventListener('click', function () {
    state.connected = false;
    state.token = '';
    state.data = null;
    state.dataSha = '';
    this.style.display = 'none';
    renderLogin();
  });

  /* ---------- Render Dashboard ---------- */
  function renderDashboard() {
    var sections = [
      { key: 'profile', icon: '👤', label: 'Profile & Links' },
      { key: 'skills', icon: '🛠️', label: 'Skills' },
      { key: 'designs', icon: '📐', label: '3D Designs' },
      { key: 'simulations', icon: '🔬', label: 'Simulations' },
      { key: 'badges', icon: '🏅', label: 'Badges' },
      { key: 'certificates', icon: '📜', label: 'Certificates' },
      { key: 'experience', icon: '💼', label: 'Experience' },
      { key: 'education', icon: '🎓', label: 'Education' }
    ];

    root.innerHTML =
      '<div class="admin-layout">' +
        '<aside class="admin-sidebar" role="navigation" aria-label="Admin sections">' +
          sections.map(function (s) {
            return '<button class="admin-sidebar__item' + (s.key === state.currentSection ? ' active' : '') + '" data-section="' + s.key + '">' +
              '<span>' + s.icon + '</span> <span>' + s.label + '</span>' +
            '</button>';
          }).join('') +
        '</aside>' +
        '<div class="admin-content" id="admin-content">' +
          '<div id="admin-status" class="admin-status" style="display:none;"></div>' +
          '<div id="admin-section-content"></div>' +
        '</div>' +
      '</div>';

    // Section navigation
    root.querySelectorAll('.admin-sidebar__item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.querySelectorAll('.admin-sidebar__item').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.currentSection = btn.getAttribute('data-section');
        renderSection();
      });
    });

    renderSection();
  }

  function renderSection() {
    var target = document.getElementById('admin-section-content');
    if (!target) return;
    var d = state.data;

    switch (state.currentSection) {
      case 'profile': renderProfileEditor(target, d); break;
      case 'skills': renderListEditor(target, d, 'skills', 'Skill Category', skillFields); break;
      case 'designs': renderListEditor(target, d, 'designs', '3D Design', designFields); break;
      case 'simulations': renderListEditor(target, d, 'simulations', 'Simulation', simulationFields); break;
      case 'badges': renderListEditor(target, d, 'badges', 'Badge', badgeFields); break;
      case 'certificates': renderListEditor(target, d, 'certificates', 'Certificate', certificateFields); break;
      case 'experience': renderListEditor(target, d, 'experience', 'Experience', experienceFields); break;
      case 'education': renderListEditor(target, d, 'education', 'Education', educationFields); break;
    }
  }

  /* ---------- Profile Editor ---------- */
  function renderProfileEditor(target, d) {
    var p = d.profile || {};
    var l = d.links || {};
    var m = d.meta || {};

    target.innerHTML =
      '<h2>Profile & Links</h2>' +
      '<div class="admin-field"><label>Full Name</label><input type="text" id="pf-name" value="' + esc(p.name || '') + '"></div>' +
      '<div class="admin-field"><label>Role / Title</label><input type="text" id="pf-role" value="' + esc(p.role || '') + '"></div>' +
      '<div class="admin-field"><label>Tagline</label><input type="text" id="pf-tagline" value="' + esc(p.tagline || '') + '"></div>' +
      '<div class="admin-field"><label>Hero Subtitle</label><input type="text" id="pf-heroSubtitle" value="' + esc(p.heroSubtitle || '') + '"></div>' +
      '<div class="admin-field"><label>Bio</label><textarea id="pf-bio">' + esc(p.bio || '') + '</textarea></div>' +
      '<div class="admin-field"><label>Location</label><input type="text" id="pf-location" value="' + esc(p.location || '') + '"></div>' +
      '<div class="admin-field"><label>Email</label><input type="email" id="pf-email" value="' + esc(p.email || '') + '"></div>' +
      '<hr style="border:none;border-top:1px solid var(--border);margin:1.5rem 0;">' +
      '<h3 style="font-size:1rem;margin-bottom:1rem;">Links</h3>' +
      '<div class="admin-field"><label>LinkedIn URL</label><input type="url" id="pf-linkedin" value="' + esc(l.linkedin || '') + '"></div>' +
      '<div class="admin-field"><label>GrabCAD URL</label><input type="url" id="pf-grabcad" value="' + esc(l.grabcad || '') + '"></div>' +
      '<div class="admin-field"><label>GitHub URL</label><input type="url" id="pf-github" value="' + esc(l.github || '') + '"></div>' +
      '<div class="admin-field"><label>Resume URL</label><input type="url" id="pf-resume" value="' + esc(l.resume || '') + '"></div>' +
      '<hr style="border:none;border-top:1px solid var(--border);margin:1.5rem 0;">' +
      '<h3 style="font-size:1rem;margin-bottom:1rem;">Site Meta</h3>' +
      '<div class="admin-field"><label>Site Title</label><input type="text" id="pf-siteTitle" value="' + esc(m.siteTitle || '') + '"></div>' +
      '<div class="admin-field"><label>Site Description</label><textarea id="pf-siteDesc">' + esc(m.siteDescription || '') + '</textarea></div>' +
      '<button class="btn btn--primary" id="save-profile-btn">Save Profile →</button>';

    document.getElementById('save-profile-btn').addEventListener('click', function () {
      state.data.profile.name = document.getElementById('pf-name').value.trim();
      state.data.profile.role = document.getElementById('pf-role').value.trim();
      state.data.profile.tagline = document.getElementById('pf-tagline').value.trim();
      state.data.profile.heroSubtitle = document.getElementById('pf-heroSubtitle').value.trim();
      state.data.profile.bio = document.getElementById('pf-bio').value.trim();
      state.data.profile.location = document.getElementById('pf-location').value.trim();
      state.data.profile.email = document.getElementById('pf-email').value.trim();
      state.data.links.linkedin = document.getElementById('pf-linkedin').value.trim();
      state.data.links.grabcad = document.getElementById('pf-grabcad').value.trim();
      state.data.links.github = document.getElementById('pf-github').value.trim();
      state.data.links.resume = document.getElementById('pf-resume').value.trim();
      state.data.meta.siteTitle = document.getElementById('pf-siteTitle').value.trim();
      state.data.meta.siteDescription = document.getElementById('pf-siteDesc').value.trim();
      saveDataJson('Update profile via admin');
    });
  }

  /* ---------- Field Definitions ---------- */
  var designFields = [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'slug', label: 'URL Slug', type: 'text', required: true, help: 'Auto-generated from title. Used in the URL.' },
    { key: 'summary', label: 'Summary', type: 'textarea' },
    { key: 'software', label: 'Software', type: 'select', options: ['SOLIDWORKS', 'AutoCAD', 'Fusion 360', 'Other'] },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'tags', label: 'Tags', type: 'tags', help: 'Comma-separated tags' },
    { key: 'featured', label: 'Featured on Home', type: 'checkbox' },
    { key: 'thumbnail', label: 'Thumbnail Image', type: 'file', folder: 'images' },
    { key: 'sections', label: 'Write-up Sections', type: 'sections' },
    { key: 'keyNumbers', label: 'Key Numbers', type: 'keynumbers' },
    { key: 'images', label: 'Gallery Images', type: 'files', folder: 'images' },
    { key: 'videos', label: 'Videos (MP4)', type: 'files', folder: 'videos' },
    { key: 'models', label: '3D Models (.glb)', type: 'files', folder: 'models' },
    { key: 'reports', label: 'Reports / Downloads', type: 'files', folder: 'reports' }
  ];

  var simulationFields = [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'slug', label: 'URL Slug', type: 'text', required: true, help: 'Auto-generated from title.' },
    { key: 'summary', label: 'Summary', type: 'textarea' },
    { key: 'software', label: 'Software', type: 'select', options: ['ANSYS', 'SOLIDWORKS Simulation', 'OpenFOAM', 'Other'] },
    { key: 'type', label: 'Simulation Type', type: 'select', options: ['CFD', 'FEA', 'Thermal', 'Modal', 'Other'] },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'tags', label: 'Tags', type: 'tags', help: 'Comma-separated tags' },
    { key: 'featured', label: 'Featured on Home', type: 'checkbox' },
    { key: 'thumbnail', label: 'Thumbnail Image', type: 'file', folder: 'images' },
    { key: 'sections', label: 'Write-up Sections', type: 'sections' },
    { key: 'keyNumbers', label: 'Key Numbers', type: 'keynumbers' },
    { key: 'images', label: 'Gallery Images', type: 'files', folder: 'images' },
    { key: 'videos', label: 'Videos (MP4)', type: 'files', folder: 'videos' },
    { key: 'models', label: '3D Models (.glb)', type: 'files', folder: 'models' },
    { key: 'reports', label: 'Reports / Downloads', type: 'files', folder: 'reports' }
  ];

  var skillFields = [
    { key: 'category', label: 'Category Name', type: 'text', required: true },
    { key: 'items', label: 'Skills', type: 'skillitems' }
  ];

  var badgeFields = [
    { key: 'name', label: 'Short Name', type: 'text', required: true },
    { key: 'fullName', label: 'Full Name', type: 'text' },
    { key: 'issuer', label: 'Issuer', type: 'text' },
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'image', label: 'Badge Image', type: 'file', folder: 'images' },
    { key: 'verifyUrl', label: 'Verification URL', type: 'url' }
  ];

  var certificateFields = [
    { key: 'title', label: 'Certificate Title', type: 'text', required: true },
    { key: 'issuer', label: 'Issuer', type: 'text' },
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'credentialId', label: 'Credential ID', type: 'text' },
    { key: 'image', label: 'Certificate Image', type: 'file', folder: 'images' },
    { key: 'verifyUrl', label: 'Verification URL', type: 'url' },
    { key: 'tags', label: 'Tags', type: 'tags' }
  ];

  var experienceFields = [
    { key: 'title', label: 'Job Title', type: 'text', required: true },
    { key: 'organization', label: 'Organization', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'startDate', label: 'Start Date', type: 'text' },
    { key: 'endDate', label: 'End Date', type: 'text', help: 'e.g., "Present"' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'highlights', label: 'Highlights', type: 'tags', help: 'One highlight per entry' }
  ];

  var educationFields = [
    { key: 'title', label: 'Degree / Program', type: 'text', required: true },
    { key: 'organization', label: 'Institution', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'startDate', label: 'Start Date', type: 'text' },
    { key: 'endDate', label: 'End Date', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'highlights', label: 'Highlights', type: 'tags', help: 'One highlight per entry' }
  ];

  /* ---------- Generic List Editor ---------- */
  function renderListEditor(target, data, dataKey, itemLabel, fields) {
    var items = data[dataKey] || [];
    var html = '<h2>' + esc(itemLabel) + 's</h2>';
    html += '<p style="color:var(--muted);font-size:0.875rem;margin-bottom:1rem;">' + items.length + ' item(s). Drag to reorder, click to edit.</p>';
    html += '<button class="btn btn--primary btn--sm" id="add-item-btn" style="margin-bottom:1.5rem;">+ Add ' + esc(itemLabel) + '</button>';

    html += '<div class="admin-list" id="admin-list">';
    items.forEach(function (item, idx) {
      var title = item.title || item.name || item.category || ('Item ' + (idx + 1));
      var meta = [item.software, item.type, item.year, item.date, item.issuer].filter(Boolean).join(' · ');
      html += '<div class="admin-list-item" data-idx="' + idx + '">' +
        '<span class="admin-list-item__drag" title="Drag to reorder">⠿</span>' +
        '<div class="admin-list-item__info">' +
          '<span class="admin-list-item__title">' + esc(title) + '</span>' +
          (meta ? '<span class="admin-list-item__meta">' + esc(meta) + '</span>' : '') +
        '</div>' +
        '<div class="admin-list-item__actions">' +
          '<button class="btn btn--sm edit-item-btn" data-idx="' + idx + '">Edit</button>' +
          '<button class="btn btn--sm" data-idx="' + idx + '" style="color:var(--danger);" onclick="this.closest(\'.admin-list-item\').querySelector(\'.confirm-delete\') ? null : this.insertAdjacentHTML(\'afterend\', \'<button class=btn\\ btn--sm\\ confirm-delete style=color:var(--danger);margin-left:0.25rem; data-idx=' + idx + '>Confirm Delete</button>\')">Delete</button>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';

    target.innerHTML = html;

    // Add item
    document.getElementById('add-item-btn').addEventListener('click', function () {
      var newItem = {};
      var prefix = dataKey.substring(0, 3);
      newItem.id = generateId(prefix);
      fields.forEach(function (f) {
        if (f.type === 'tags' || f.type === 'files') newItem[f.key] = [];
        else if (f.type === 'checkbox') newItem[f.key] = false;
        else if (f.type === 'number') newItem[f.key] = new Date().getFullYear();
        else if (f.type === 'sections') newItem[f.key] = [];
        else if (f.type === 'keynumbers') newItem[f.key] = [];
        else if (f.type === 'skillitems') newItem[f.key] = [];
        else newItem[f.key] = '';
      });
      openItemModal(newItem, dataKey, fields, itemLabel, -1);
    });

    // Edit items
    target.querySelectorAll('.edit-item-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-idx'), 10);
        openItemModal(JSON.parse(JSON.stringify(items[idx])), dataKey, fields, itemLabel, idx);
      });
    });

    // Delete items (delegated)
    target.addEventListener('click', function (e) {
      var confirmBtn = e.target.closest('.confirm-delete');
      if (confirmBtn) {
        var idx = parseInt(confirmBtn.getAttribute('data-idx'), 10);
        state.data[dataKey].splice(idx, 1);
        saveDataJson('Delete ' + itemLabel).then(function () {
          renderSection();
        });
      }
    });

    // Simple drag-to-reorder using data attributes
    initDragReorder(target.querySelector('.admin-list'), dataKey);
  }

  /* ---------- Item Modal ---------- */
  function openItemModal(item, dataKey, fields, itemLabel, editIdx) {
    // Remove existing modal
    var existing = document.getElementById('item-modal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'item-modal';
    modal.className = 'admin-modal active';
    modal.innerHTML =
      '<div class="admin-modal__content">' +
        '<div class="admin-modal__header">' +
          '<h3 class="admin-modal__title">' + (editIdx >= 0 ? 'Edit' : 'Add') + ' ' + esc(itemLabel) + '</h3>' +
          '<button class="admin-modal__close" id="modal-close">✕</button>' +
        '</div>' +
        '<div id="modal-fields"></div>' +
        '<div style="display:flex;gap:0.5rem;margin-top:1.5rem;">' +
          '<button class="btn btn--primary" id="modal-save">Save & Publish →</button>' +
          '<button class="btn" id="modal-cancel">Cancel</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    var fieldsContainer = document.getElementById('modal-fields');
    renderModalFields(fieldsContainer, fields, item);

    // Auto-generate slug from title
    var titleInput = fieldsContainer.querySelector('[data-field="title"]');
    var slugInput = fieldsContainer.querySelector('[data-field="slug"]');
    if (titleInput && slugInput) {
      titleInput.addEventListener('input', function () {
        if (!slugInput._userEdited) {
          slugInput.value = slugify(titleInput.value);
        }
      });
      if (slugInput) {
        slugInput.addEventListener('input', function () { slugInput._userEdited = true; });
      }
    }

    // Close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

    // Save
    document.getElementById('modal-save').addEventListener('click', function () {
      var updated = collectModalFields(fieldsContainer, fields, item);
      if (!updated) return; // validation failed

      if (editIdx >= 0) {
        state.data[dataKey][editIdx] = updated;
      } else {
        state.data[dataKey].push(updated);
      }

      saveDataJson((editIdx >= 0 ? 'Update' : 'Add') + ' ' + itemLabel + ': ' + (updated.title || updated.name || updated.category))
        .then(function () {
          closeModal();
          renderSection();
        });
    });

    function closeModal() {
      modal.classList.remove('active');
      setTimeout(function () { modal.remove(); }, 200);
    }
  }

  function renderModalFields(container, fields, item) {
    var html = '';
    fields.forEach(function (f) {
      var val = item[f.key];
      html += '<div class="admin-field">';
      html += '<label>' + esc(f.label) + (f.required ? ' *' : '') + '</label>';

      switch (f.type) {
        case 'text':
        case 'url':
          html += '<input type="' + (f.type === 'url' ? 'url' : 'text') + '" data-field="' + f.key + '" value="' + esc(val || '') + '">';
          break;
        case 'textarea':
          html += '<textarea data-field="' + f.key + '">' + esc(val || '') + '</textarea>';
          break;
        case 'number':
          html += '<input type="number" data-field="' + f.key + '" value="' + esc(String(val || '')) + '">';
          break;
        case 'select':
          html += '<select data-field="' + f.key + '">';
          html += '<option value="">— Select —</option>';
          (f.options || []).forEach(function (opt) {
            html += '<option value="' + esc(opt) + '"' + (val === opt ? ' selected' : '') + '>' + esc(opt) + '</option>';
          });
          html += '</select>';
          break;
        case 'checkbox':
          html += '<input type="checkbox" data-field="' + f.key + '"' + (val ? ' checked' : '') + ' style="width:auto;">';
          break;
        case 'tags':
          var tagsVal = Array.isArray(val) ? val.join(', ') : (val || '');
          html += '<input type="text" data-field="' + f.key + '" data-type="tags" value="' + esc(tagsVal) + '">';
          break;
        case 'file':
          html += '<div class="file-upload" data-field="' + f.key + '" data-folder="' + (f.folder || 'images') + '" data-type="file">';
          html += '<p class="file-upload__text"><strong>Click or drag</strong> to upload</p>';
          html += '</div>';
          if (val) {
            html += '<div class="uploaded-files"><span class="uploaded-file">' + esc(val) + ' <span class="uploaded-file__remove" data-clear-field="' + f.key + '">✕</span></span></div>';
          }
          break;
        case 'files':
          html += '<div class="file-upload" data-field="' + f.key + '" data-folder="' + (f.folder || 'images') + '" data-type="files">';
          html += '<p class="file-upload__text"><strong>Click or drag</strong> to upload multiple files</p>';
          html += '</div>';
          if (Array.isArray(val) && val.length > 0) {
            html += '<div class="uploaded-files" data-list-field="' + f.key + '">';
            val.forEach(function (v, vi) {
              html += '<span class="uploaded-file">' + esc(v.split('/').pop()) + ' <span class="uploaded-file__remove" data-remove-field="' + f.key + '" data-remove-idx="' + vi + '">✕</span></span>';
            });
            html += '</div>';
          }
          break;
        case 'sections':
          html += '<div data-field="' + f.key + '" data-type="sections" id="sections-editor"></div>';
          break;
        case 'keynumbers':
          html += '<div data-field="' + f.key + '" data-type="keynumbers" id="keynumbers-editor"></div>';
          break;
        case 'skillitems':
          html += '<div data-field="' + f.key + '" data-type="skillitems" id="skillitems-editor"></div>';
          break;
      }

      if (f.help) html += '<p class="admin-field__help">' + esc(f.help) + '</p>';
      html += '</div>';
    });

    container.innerHTML = html;

    // Initialize complex field editors
    initSectionsEditor(container, item);
    initKeyNumbersEditor(container, item);
    initSkillItemsEditor(container, item);
    initFileUploads(container, item);
    initRemoveButtons(container, item);
  }

  function collectModalFields(container, fields, item) {
    var updated = Object.assign({}, item);
    var valid = true;

    fields.forEach(function (f) {
      var el;
      switch (f.type) {
        case 'text':
        case 'url':
        case 'textarea':
          el = container.querySelector('[data-field="' + f.key + '"]');
          if (el) updated[f.key] = el.value.trim();
          break;
        case 'number':
          el = container.querySelector('[data-field="' + f.key + '"]');
          if (el) updated[f.key] = parseInt(el.value, 10) || 0;
          break;
        case 'select':
          el = container.querySelector('[data-field="' + f.key + '"]');
          if (el) updated[f.key] = el.value;
          break;
        case 'checkbox':
          el = container.querySelector('[data-field="' + f.key + '"]');
          if (el) updated[f.key] = el.checked;
          break;
        case 'tags':
          el = container.querySelector('[data-field="' + f.key + '"]');
          if (el) {
            updated[f.key] = el.value.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
          }
          break;
        case 'file':
          // Already set by upload handler
          break;
        case 'files':
          // Already set by upload handler
          break;
        case 'sections':
        case 'keynumbers':
        case 'skillitems':
          // Already maintained in item reference
          updated[f.key] = item[f.key];
          break;
      }

      if (f.required && !updated[f.key]) {
        var label = container.querySelector('[data-field="' + f.key + '"]');
        if (label) label.style.borderColor = 'var(--danger)';
        valid = false;
      }
    });

    if (!valid) {
      alert('Please fill in all required fields.');
      return null;
    }
    return updated;
  }

  /* ---------- Sections Editor ---------- */
  function initSectionsEditor(container, item) {
    var editor = container.querySelector('#sections-editor');
    if (!editor) return;
    item.sections = item.sections || [];

    function render() {
      var html = '';
      item.sections.forEach(function (sec, i) {
        html += '<div style="border:1px solid var(--border);border-radius:var(--radius);padding:0.75rem;margin-bottom:0.5rem;">';
        html += '<input type="text" placeholder="Section heading" value="' + esc(sec.heading || '') + '" data-sec-idx="' + i + '" data-sec-key="heading" style="margin-bottom:0.5rem;">';
        html += '<textarea placeholder="Section text" data-sec-idx="' + i + '" data-sec-key="text" style="min-height:60px;">' + esc(sec.text || '') + '</textarea>';
        html += '<button class="btn btn--sm" data-remove-sec="' + i + '" style="color:var(--danger);margin-top:0.25rem;">Remove Section</button>';
        html += '</div>';
      });
      html += '<button class="btn btn--sm" id="add-section-btn">+ Add Section</button>';
      editor.innerHTML = html;

      // Events
      editor.querySelectorAll('[data-sec-idx]').forEach(function (el) {
        el.addEventListener('input', function () {
          var idx = parseInt(el.getAttribute('data-sec-idx'), 10);
          var key = el.getAttribute('data-sec-key');
          item.sections[idx][key] = el.value;
        });
      });
      editor.querySelectorAll('[data-remove-sec]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          item.sections.splice(parseInt(btn.getAttribute('data-remove-sec'), 10), 1);
          render();
        });
      });
      var addBtn = editor.querySelector('#add-section-btn');
      if (addBtn) addBtn.addEventListener('click', function () {
        item.sections.push({ heading: '', text: '' });
        render();
      });
    }
    render();
  }

  /* ---------- Key Numbers Editor ---------- */
  function initKeyNumbersEditor(container, item) {
    var editor = container.querySelector('#keynumbers-editor');
    if (!editor) return;
    item.keyNumbers = item.keyNumbers || [];

    function render() {
      var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">';
      item.keyNumbers.forEach(function (kn, i) {
        html += '<div style="border:1px solid var(--border);border-radius:var(--radius);padding:0.5rem;">';
        html += '<input type="text" placeholder="Label" value="' + esc(kn.label || '') + '" data-kn-idx="' + i + '" data-kn-key="label" style="margin-bottom:0.25rem;font-size:0.75rem;">';
        html += '<input type="text" placeholder="Value" value="' + esc(kn.value || '') + '" data-kn-idx="' + i + '" data-kn-key="value" style="font-weight:700;">';
        html += '<button class="btn btn--sm" data-remove-kn="' + i + '" style="color:var(--danger);margin-top:0.25rem;font-size:0.625rem;">Remove</button>';
        html += '</div>';
      });
      html += '</div>';
      html += '<button class="btn btn--sm" id="add-kn-btn" style="margin-top:0.5rem;">+ Add Number</button>';
      editor.innerHTML = html;

      editor.querySelectorAll('[data-kn-idx]').forEach(function (el) {
        el.addEventListener('input', function () {
          var idx = parseInt(el.getAttribute('data-kn-idx'), 10);
          item.keyNumbers[idx][el.getAttribute('data-kn-key')] = el.value;
        });
      });
      editor.querySelectorAll('[data-remove-kn]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          item.keyNumbers.splice(parseInt(btn.getAttribute('data-remove-kn'), 10), 1);
          render();
        });
      });
      var addBtn = editor.querySelector('#add-kn-btn');
      if (addBtn) addBtn.addEventListener('click', function () {
        item.keyNumbers.push({ label: '', value: '' });
        render();
      });
    }
    render();
  }

  /* ---------- Skill Items Editor ---------- */
  function initSkillItemsEditor(container, item) {
    var editor = container.querySelector('#skillitems-editor');
    if (!editor) return;
    item.items = item.items || [];

    function render() {
      var html = '';
      item.items.forEach(function (si, i) {
        html += '<div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.5rem;">';
        html += '<input type="text" placeholder="Skill name" value="' + esc(si.name || '') + '" data-si-idx="' + i + '" data-si-key="name" style="flex:2;">';
        html += '<input type="number" placeholder="Level %" value="' + (si.level || 50) + '" min="0" max="100" data-si-idx="' + i + '" data-si-key="level" style="flex:1;max-width:80px;">';
        html += '<button class="btn btn--sm" data-remove-si="' + i + '" style="color:var(--danger);">✕</button>';
        html += '</div>';
      });
      html += '<button class="btn btn--sm" id="add-si-btn">+ Add Skill</button>';
      editor.innerHTML = html;

      editor.querySelectorAll('[data-si-idx]').forEach(function (el) {
        el.addEventListener('input', function () {
          var idx = parseInt(el.getAttribute('data-si-idx'), 10);
          var key = el.getAttribute('data-si-key');
          item.items[idx][key] = key === 'level' ? parseInt(el.value, 10) : el.value;
        });
      });
      editor.querySelectorAll('[data-remove-si]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          item.items.splice(parseInt(btn.getAttribute('data-remove-si'), 10), 1);
          render();
        });
      });
      var addBtn = editor.querySelector('#add-si-btn');
      if (addBtn) addBtn.addEventListener('click', function () {
        item.items.push({ name: '', level: 50 });
        render();
      });
    }
    render();
  }

  /* ---------- File Upload Handlers ---------- */
  function initFileUploads(container, item) {
    container.querySelectorAll('.file-upload').forEach(function (dropZone) {
      var field = dropZone.getAttribute('data-field');
      var folder = dropZone.getAttribute('data-folder');
      var isMulti = dropZone.getAttribute('data-type') === 'files';

      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.style.display = 'none';
      if (isMulti) fileInput.multiple = true;
      dropZone.appendChild(fileInput);

      dropZone.addEventListener('click', function () { fileInput.click(); });
      dropZone.addEventListener('dragover', function (e) { e.preventDefault(); dropZone.classList.add('dragover'); });
      dropZone.addEventListener('dragleave', function () { dropZone.classList.remove('dragover'); });
      dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
      });
      fileInput.addEventListener('change', function () {
        handleFiles(fileInput.files);
        fileInput.value = '';
      });

      function handleFiles(files) {
        if (!files.length) return;
        var arr = Array.from(files);
        var progress = document.createElement('div');
        progress.className = 'upload-progress';
        progress.innerHTML = '<div class="upload-progress__bar"><div class="upload-progress__fill" style="width:0%"></div></div><p class="upload-progress__text">Uploading...</p>';
        dropZone.parentElement.appendChild(progress);

        var completed = 0;
        var promises = arr.map(function (file) {
          return uploadFile(file, folder).then(function (path) {
            completed++;
            var pct = Math.round(completed / arr.length * 100);
            progress.querySelector('.upload-progress__fill').style.width = pct + '%';
            progress.querySelector('.upload-progress__text').textContent = completed + '/' + arr.length + ' uploaded';
            return path;
          });
        });

        Promise.all(promises).then(function (paths) {
          if (isMulti) {
            item[field] = (item[field] || []).concat(paths);
          } else {
            item[field] = paths[0];
          }
          setTimeout(function () { progress.remove(); }, 1500);
          showStatus('File(s) uploaded successfully.', 'success');
          // Re-render the modal fields to show uploaded files
          var modalFields = document.getElementById('modal-fields');
          if (modalFields) {
            var fieldDefs = state.currentSection === 'designs' ? designFields :
                           state.currentSection === 'simulations' ? simulationFields :
                           state.currentSection === 'badges' ? badgeFields :
                           state.currentSection === 'certificates' ? certificateFields : [];
            // Just update the uploaded files display
            updateUploadedDisplay(container, item, field, isMulti);
          }
        }).catch(function (err) {
          progress.querySelector('.upload-progress__text').textContent = 'Error: ' + err.message;
          progress.querySelector('.upload-progress__fill').style.background = 'var(--danger)';
        });
      }
    });
  }

  function updateUploadedDisplay(container, item, field, isMulti) {
    // Update file display after upload
    var existing = container.querySelector('[data-list-field="' + field + '"]');
    if (existing) existing.remove();

    var dropZone = container.querySelector('[data-field="' + field + '"]');
    if (!dropZone) return;

    var val = item[field];
    if (isMulti && Array.isArray(val) && val.length > 0) {
      var html = '<div class="uploaded-files" data-list-field="' + field + '">';
      val.forEach(function (v, vi) {
        html += '<span class="uploaded-file">' + esc(v.split('/').pop()) + ' <span class="uploaded-file__remove" data-remove-field="' + field + '" data-remove-idx="' + vi + '">✕</span></span>';
      });
      html += '</div>';
      dropZone.insertAdjacentHTML('afterend', html);
    } else if (!isMulti && val) {
      var single = '<div class="uploaded-files"><span class="uploaded-file">' + esc(val) + ' <span class="uploaded-file__remove" data-clear-field="' + field + '">✕</span></span></div>';
      dropZone.insertAdjacentHTML('afterend', single);
    }

    initRemoveButtons(container, item);
  }

  function initRemoveButtons(container, item) {
    container.querySelectorAll('[data-clear-field]').forEach(function (btn) {
      btn.onclick = function () {
        item[btn.getAttribute('data-clear-field')] = '';
        btn.closest('.uploaded-files').remove();
      };
    });
    container.querySelectorAll('[data-remove-field]').forEach(function (btn) {
      btn.onclick = function () {
        var field = btn.getAttribute('data-remove-field');
        var idx = parseInt(btn.getAttribute('data-remove-idx'), 10);
        if (Array.isArray(item[field])) {
          item[field].splice(idx, 1);
          updateUploadedDisplay(container, item, field, true);
        }
      };
    });
  }

  /* ---------- Drag Reorder ---------- */
  function initDragReorder(list, dataKey) {
    if (!list) return;
    var items = list.querySelectorAll('.admin-list-item');
    var dragIdx = -1;

    items.forEach(function (el, idx) {
      el.draggable = true;
      el.addEventListener('dragstart', function (e) {
        dragIdx = idx;
        el.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
      });
      el.addEventListener('dragend', function () {
        el.style.opacity = '1';
      });
      el.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      el.addEventListener('drop', function (e) {
        e.preventDefault();
        var dropIdx = idx;
        if (dragIdx === dropIdx) return;
        var arr = state.data[dataKey];
        var moved = arr.splice(dragIdx, 1)[0];
        arr.splice(dropIdx, 0, moved);
        saveDataJson('Reorder ' + dataKey).then(function () {
          renderSection();
        });
      });
    });
  }

  /* ---------- Init ---------- */
  function init() {
    var saved = loadCredentials();
    if (saved && saved.token) {
      // Auto-connect if credentials are saved
      state.username = saved.username;
      state.repo = saved.repo;
      state.branch = saved.branch || 'main';
      state.token = saved.token;

      root.innerHTML = '<div class="page-loading"><div class="spinner"></div><p class="page-loading__text">Connecting...</p></div>';

      ghFetch('/repos/' + state.username + '/' + state.repo)
        .then(function (res) {
          if (!res.ok) throw new Error('Connection failed.');
          return fetchDataJson();
        })
        .then(function (data) {
          state.data = data;
          state.connected = true;
          document.getElementById('logout-btn').style.display = '';
          renderDashboard();
        })
        .catch(function () {
          clearCredentials();
          renderLogin();
        });
    } else {
      renderLogin();
    }
  }

  init();

})();
