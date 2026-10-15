/* ============================================================
   GALLERY.JS — Card grids with filter for designs & simulations
   ============================================================ */
(function () {
  'use strict';
  var P = window.Portfolio;

  function initGallery() {
    var pageType = document.body.getAttribute('data-page'); // 'designs' or 'simulations'
    if (pageType !== 'designs' && pageType !== 'simulations') return;

    var isDesigns = pageType === 'designs';
    var dataKey = isDesigns ? 'designs' : 'simulations';
    var itemType = isDesigns ? 'design' : 'simulation';

    P.loadData().then(function (data) {
      var items = data[dataKey] || [];
      var gridEl = document.getElementById('gallery-grid');
      var filterBar = document.getElementById('filter-bar');
      var countEl = document.getElementById('item-count');
      if (!gridEl) return;

      // Collect all tags and software values
      var allTags = new Set();
      var allSoftware = new Set();
      items.forEach(function (item) {
        (item.tags || []).forEach(function (t) { allTags.add(t); });
        if (item.software) allSoftware.add(item.software);
        if (item.type) allSoftware.add(item.type); // CFD/FEA for simulations
      });

      // Build filter buttons
      if (filterBar) {
        var html = '<button class="filter-btn active" data-filter="all">All</button>';
        allSoftware.forEach(function (sw) {
          html += '<button class="filter-btn" data-filter="software:' + sw + '">' + P.escHtml(sw) + '</button>';
        });
        allTags.forEach(function (tag) {
          html += '<button class="filter-btn" data-filter="tag:' + tag + '">' + P.escHtml(tag) + '</button>';
        });
        filterBar.innerHTML = html;

        // Filter event listeners
        filterBar.addEventListener('click', function (e) {
          var btn = e.target.closest('.filter-btn');
          if (!btn) return;
          filterBar.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          renderItems(btn.getAttribute('data-filter'));
        });

        // Check URL for initial filter
        var urlFilter = P.getParam('filter');
        if (urlFilter) {
          var matchBtn = filterBar.querySelector('[data-filter="' + urlFilter + '"]');
          if (matchBtn) {
            filterBar.querySelector('.filter-btn.active').classList.remove('active');
            matchBtn.classList.add('active');
            renderItems(urlFilter);
            return;
          }
        }
      }

      function renderItems(filter) {
        var filtered = items;
        if (filter && filter !== 'all') {
          if (filter.startsWith('software:')) {
            var sw = filter.replace('software:', '');
            filtered = items.filter(function (item) {
              return item.software === sw || item.type === sw;
            });
          } else if (filter.startsWith('tag:')) {
            var tag = filter.replace('tag:', '');
            filtered = items.filter(function (item) {
              return (item.tags || []).indexOf(tag) !== -1;
            });
          }
        }

        if (countEl) {
          countEl.textContent = filtered.length + ' item' + (filtered.length !== 1 ? 's' : '');
        }

        if (filtered.length === 0) {
          gridEl.innerHTML =
            '<div class="empty-state">' +
              '<div class="empty-state__icon">📐</div>' +
              '<p class="empty-state__text">No items found for this filter.</p>' +
              '<p class="empty-state__hint">Try selecting a different filter or add items via the admin page.</p>' +
            '</div>';
          return;
        }

        gridEl.innerHTML = filtered.map(function (item) {
          return P.renderCard(item, itemType);
        }).join('');
      }

      renderItems('all');
    }).catch(function (err) {
      console.error('Failed to load gallery data:', err);
      var gridEl = document.getElementById('gallery-grid');
      if (gridEl) {
        gridEl.innerHTML = '<div class="empty-state"><p class="empty-state__text">Failed to load data.</p></div>';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
  } else {
    initGallery();
  }
})();
