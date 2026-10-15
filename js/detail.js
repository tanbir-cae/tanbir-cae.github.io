/* ============================================================
   DETAIL.JS — Single item detail page renderer
   Handles designs & simulations, gallery, video, 3D viewer
   ============================================================ */
(function () {
  'use strict';
  var P = window.Portfolio;

  function initDetail() {
    if (document.body.getAttribute('data-page') !== 'detail') return;

    var type = P.getParam('type'); // 'design' or 'simulation'
    var slug = P.getParam('slug');
    if (!type || !slug) {
      showError('Missing item type or slug in URL.');
      return;
    }

    P.loadData().then(function (data) {
      var collection = type === 'design' ? data.designs : data.simulations;
      var item = (collection || []).find(function (i) { return i.slug === slug; });
      if (!item) {
        showError('Item not found: "' + slug + '"');
        return;
      }
      renderDetail(item, type, data);
    }).catch(function (err) {
      showError('Failed to load data: ' + err.message);
    });
  }

  function showError(msg) {
    var main = document.getElementById('detail-content');
    if (main) {
      main.innerHTML =
        '<div class="container section">' +
          '<div class="empty-state">' +
            '<div class="empty-state__icon">⚠️</div>' +
            '<p class="empty-state__text">' + P.escHtml(msg) + '</p>' +
            '<p class="empty-state__hint"><a href="' + P.BASE + 'index.html" style="color:var(--accent)">← Return home</a></p>' +
          '</div>' +
        '</div>';
    }
  }

  function renderDetail(item, type, data) {
    var esc = P.escHtml;
    var parentPage = type === 'design' ? 'designs.html' : 'simulations.html';
    var parentLabel = type === 'design' ? '3D Designs' : 'Simulations';

    // Page title
    document.title = esc(item.title) + ' — ' + esc(data.profile.name);

    // Meta description
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', esc(item.summary));

    // Breadcrumb
    var breadcrumb = document.getElementById('detail-breadcrumb');
    if (breadcrumb) {
      breadcrumb.innerHTML =
        '<a href="' + P.BASE + 'index.html">Home</a>' +
        '<span>/</span>' +
        '<a href="' + P.BASE + parentPage + '">' + esc(parentLabel) + '</a>' +
        '<span>/</span>' +
        '<span>' + esc(item.title) + '</span>';
    }

    // Title
    var titleEl = document.getElementById('detail-title');
    if (titleEl) titleEl.textContent = item.title;

    // Meta tags
    var metaEl = document.getElementById('detail-meta');
    if (metaEl) {
      var tags = '';
      if (item.software) tags += '<span class="tag tag--software">' + esc(item.software) + '</span>';
      if (item.type) tags += '<span class="tag tag--software">' + esc(item.type) + '</span>';
      tags += '<span class="tag">' + esc(String(item.year || '')) + '</span>';
      (item.tags || []).forEach(function (t) {
        tags += '<span class="tag">' + esc(t) + '</span>';
      });
      metaEl.innerHTML = tags;
    }

    // Main content sections
    var mainEl = document.getElementById('detail-main');
    if (mainEl) {
      var html = '';

      // Write-up sections
      (item.sections || []).forEach(function (sec) {
        html += '<h2>' + esc(sec.heading) + '</h2>';
        html += '<p>' + esc(sec.text) + '</p>';
      });

      // Image gallery
      if (item.images && item.images.length > 0) {
        html += '<h2>Gallery</h2>';
        html += '<div class="gallery-grid">';
        item.images.forEach(function (img, idx) {
          var src = P.asset(img);
          html += '<div class="gallery-grid__item" data-gallery-idx="' + idx + '">';
          html += '<img src="' + src + '" alt="' + esc(item.title) + ' image ' + (idx + 1) + '" loading="lazy">';
          html += '</div>';
        });
        html += '</div>';
      }

      // Videos
      if (item.videos && item.videos.length > 0) {
        html += '<h2>Videos</h2>';
        item.videos.forEach(function (vid) {
          var src = P.asset(vid);
          html += '<div style="margin-bottom:1rem;">';
          html += '<video controls preload="metadata" style="width:100%;border-radius:var(--radius);border:1px solid var(--border)">';
          html += '<source src="' + src + '" type="video/mp4">';
          html += 'Your browser does not support video playback.';
          html += '</video>';
          html += '</div>';
        });
      }

      // 3D Models (model-viewer)
      if (item.models && item.models.length > 0) {
        html += '<h2>3D Model</h2>';
        item.models.forEach(function (model) {
          var src = P.asset(model);
          html += '<div class="model-viewer-wrap">';
          html += '<model-viewer src="' + src + '" alt="' + esc(item.title) + ' 3D model" ';
          html += 'auto-rotate camera-controls touch-action="pan-y" ';
          html += 'shadow-intensity="1" exposure="0.8" ';
          html += 'style="width:100%;height:100%;"></model-viewer>';
          html += '</div>';
        });
        // Load model-viewer if not already present
        if (!document.querySelector('script[src*="model-viewer"]')) {
          var script = document.createElement('script');
          script.type = 'module';
          script.src = 'https://unpkg.com/@google/model-viewer@2.1.1/dist/model-viewer.min.js';
          document.head.appendChild(script);
        }
      }

      // Reports / downloads
      if (item.reports && item.reports.length > 0) {
        html += '<h2>Reports & Downloads</h2>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;">';
        item.reports.forEach(function (report) {
          var src = P.asset(report);
          var filename = report.split('/').pop();
          html += '<a href="' + src + '" download class="btn btn--sm" target="_blank">';
          html += '📄 ' + esc(filename);
          html += '</a>';
        });
        html += '</div>';
      }

      mainEl.innerHTML = html;

      // Gallery lightbox
      mainEl.querySelectorAll('.gallery-grid__item').forEach(function (el) {
        el.addEventListener('click', function () {
          var idx = parseInt(el.getAttribute('data-gallery-idx'), 10);
          P.lightbox.open(item.images, idx);
        });
      });
    }

    // Sidebar: Key Numbers
    var sidebarEl = document.getElementById('detail-sidebar');
    if (sidebarEl) {
      var sideHtml = '';

      if (item.keyNumbers && item.keyNumbers.length > 0) {
        sideHtml += '<div class="key-numbers">';
        item.keyNumbers.forEach(function (kn) {
          sideHtml += '<div class="key-number">';
          sideHtml += '<div class="key-number__value">' + esc(kn.value) + '</div>';
          sideHtml += '<div class="key-number__label">' + esc(kn.label) + '</div>';
          sideHtml += '</div>';
        });
        sideHtml += '</div>';
      }

      // Info box
      sideHtml += '<div style="padding:1rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-alt);margin-bottom:1rem;">';
      sideHtml += '<div class="mono-label" style="margin-bottom:0.5rem;">Project Info</div>';
      if (item.software) sideHtml += '<p style="font-size:0.8125rem;margin-bottom:0.375rem;"><strong>Software:</strong> ' + esc(item.software) + '</p>';
      if (item.type) sideHtml += '<p style="font-size:0.8125rem;margin-bottom:0.375rem;"><strong>Type:</strong> ' + esc(item.type) + '</p>';
      if (item.year) sideHtml += '<p style="font-size:0.8125rem;margin-bottom:0.375rem;"><strong>Year:</strong> ' + esc(String(item.year)) + '</p>';
      sideHtml += '</div>';

      // Back link
      sideHtml += '<a href="' + P.BASE + parentPage + '" class="btn" style="width:100%;justify-content:center;">← Back to ' + esc(parentLabel) + '</a>';

      sidebarEl.innerHTML = sideHtml;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetail);
  } else {
    initDetail();
  }
})();
