/* ============================================================
   APP.JS — Shared logic: data loading, nav, utilities
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Base path resolution ---------- */
  // Works at both root and /REPO/ subdirectory on GitHub Pages
  function getBasePath() {
    var scripts = document.querySelectorAll('script[src*="app.js"]');
    if (scripts.length) {
      var src = scripts[0].getAttribute('src');
      // src is like "js/app.js" or "../js/app.js" → derive base
      var parts = src.split('/');
      parts.pop(); // remove filename
      parts.pop(); // remove js/
      return parts.length ? parts.join('/') + '/' : '';
    }
    return '';
  }

  var BASE = getBasePath();

  window.Portfolio = window.Portfolio || {};
  window.Portfolio.BASE = BASE;

  /* ---------- Data loading ---------- */
  var _dataCache = null;

  window.Portfolio.loadData = function () {
    if (_dataCache) return Promise.resolve(_dataCache);
    return fetch(BASE + 'content/data.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load data.json: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        _dataCache = data;
        return data;
      });
  };

  /* ---------- Resolve asset path ---------- */
  window.Portfolio.asset = function (path) {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return BASE + path;
  };

  /* ---------- URL query params ---------- */
  window.Portfolio.getParam = function (name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  };

  /* ---------- Slug from URL ---------- */
  window.Portfolio.getSlug = function () {
    return window.Portfolio.getParam('slug') || '';
  };

  /* ---------- Header scroll effect ---------- */
  function initHeader() {
    var header = document.querySelector('.header');
    if (!header) return;
    var scrolled = false;
    function onScroll() {
      var isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        scrolled = isScrolled;
        header.classList.toggle('scrolled', scrolled);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Active nav link ---------- */
  function setActiveNav() {
    var page = document.body.getAttribute('data-page');
    if (!page) return;
    document.querySelectorAll('.header__nav a, .mobile-nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var linkPage = href.replace(/.*\//, '').replace('.html', '').replace(/#.*/, '') || 'index';
      a.classList.toggle('active', linkPage === page || href.includes(page + '.html'));
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  function initReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
  }

  /* ---------- Skill bar animation ---------- */
  window.Portfolio.animateSkillBars = function () {
    var bars = document.querySelectorAll('.skill-bar__fill[data-level]');
    if (!bars.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.width = e.target.getAttribute('data-level') + '%';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(function (b) { obs.observe(b); });
  };

  /* ---------- Lightbox ---------- */
  window.Portfolio.lightbox = {
    _images: [],
    _current: 0,
    open: function (images, index) {
      this._images = images;
      this._current = index || 0;
      var lb = document.getElementById('lightbox');
      if (!lb) this._create();
      lb = document.getElementById('lightbox');
      this._show();
      lb.classList.add('active');
      document.body.style.overflow = 'hidden';
    },
    close: function () {
      var lb = document.getElementById('lightbox');
      if (lb) lb.classList.remove('active');
      document.body.style.overflow = '';
    },
    _show: function () {
      var lb = document.getElementById('lightbox');
      var img = lb.querySelector('.lightbox__content');
      img.src = window.Portfolio.asset(this._images[this._current]);
      img.alt = 'Image ' + (this._current + 1) + ' of ' + this._images.length;
    },
    _create: function () {
      var self = this;
      var lb = document.createElement('div');
      lb.id = 'lightbox';
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-label', 'Image viewer');
      lb.innerHTML =
        '<button class="lightbox__close" aria-label="Close">&times;</button>' +
        '<button class="lightbox__nav lightbox__nav--prev" aria-label="Previous">&#8249;</button>' +
        '<img class="lightbox__content" src="" alt="">' +
        '<button class="lightbox__nav lightbox__nav--next" aria-label="Next">&#8250;</button>';
      lb.querySelector('.lightbox__close').onclick = function () { self.close(); };
      lb.querySelector('.lightbox__nav--prev').onclick = function () {
        self._current = (self._current - 1 + self._images.length) % self._images.length;
        self._show();
      };
      lb.querySelector('.lightbox__nav--next').onclick = function () {
        self._current = (self._current + 1) % self._images.length;
        self._show();
      };
      lb.addEventListener('click', function (e) { if (e.target === lb) self.close(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('active')) return;
        if (e.key === 'Escape') self.close();
        if (e.key === 'ArrowLeft') lb.querySelector('.lightbox__nav--prev').click();
        if (e.key === 'ArrowRight') lb.querySelector('.lightbox__nav--next').click();
      });
      document.body.appendChild(lb);
    }
  };

  /* ---------- Toast notifications ---------- */
  window.Portfolio.toast = function (message, type) {
    type = type || 'info';
    var container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s';
      setTimeout(function () { toast.remove(); }, 300);
    }, 4000);
  };

  /* ---------- Render nav HTML ---------- */
  window.Portfolio.renderNav = function () {
    // Find all nav containers and inject links
    var navLinks = [
      { href: 'index.html', label: 'Home' },
      { href: 'designs.html', label: '3D Designs' },
      { href: 'simulations.html', label: 'Simulations' },
      { href: 'skills.html', label: 'Skills' },
      { href: 'certifications.html', label: 'Certifications' },
      { href: 'experience.html', label: 'Experience' },
      { href: 'contact.html', label: 'Contact' }
    ];
    var desktopNav = document.querySelector('.header__nav');
    var mobileNav = document.querySelector('.mobile-nav');
    if (desktopNav) {
      desktopNav.innerHTML = navLinks.map(function (l) {
        return '<a href="' + BASE + l.href + '">' + l.label + '</a>';
      }).join('');
    }
    if (mobileNav) {
      mobileNav.innerHTML = navLinks.map(function (l) {
        return '<a href="' + BASE + l.href + '">' + l.label + '</a>';
      }).join('');
    }
  };

  /* ---------- HTML escape ---------- */
  window.Portfolio.escHtml = function (str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  /* ---------- Card renderer ---------- */
  window.Portfolio.renderCard = function (item, type) {
    var esc = window.Portfolio.escHtml;
    var thumbSrc = item.thumbnail ? window.Portfolio.asset(item.thumbnail) : '';
    var detailHref = BASE + 'detail.html?type=' + encodeURIComponent(type) + '&slug=' + encodeURIComponent(item.slug);
    var tags = (item.tags || []).map(function (t) {
      return '<span class="tag">' + esc(t) + '</span>';
    }).join('');
    var softwareTag = item.software
      ? '<span class="tag tag--software">' + esc(item.software) + '</span>'
      : '';
    var typeTag = item.type
      ? '<span class="tag tag--software">' + esc(item.type) + '</span>'
      : '';

    return '<a class="card" href="' + detailHref + '" aria-label="View details: ' + esc(item.title) + '">' +
      '<div class="card__thumb">' +
        (thumbSrc
          ? '<img src="' + thumbSrc + '" alt="' + esc(item.title) + '" loading="lazy">'
          : '<span class="card__thumb-placeholder">No image yet</span>') +
      '</div>' +
      '<div class="card__body">' +
        '<div class="card__tags">' + softwareTag + typeTag + tags + '</div>' +
        '<h3 class="card__title">' + esc(item.title) + '</h3>' +
        '<p class="card__summary">' + esc(item.summary) + '</p>' +
        '<div class="card__meta">' +
          '<span class="card__year">' + esc(String(item.year || '')) + '</span>' +
          '<span class="card__arrow">→</span>' +
        '</div>' +
      '</div>' +
    '</a>';
  };

  /* ---------- Init on DOM ready ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initMobileNav();
    window.Portfolio.renderNav();
    setActiveNav();
    // Reveal after a short delay to allow page scripts to add .reveal elements
    setTimeout(initReveal, 100);
  });

})();
