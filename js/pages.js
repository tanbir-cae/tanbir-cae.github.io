/* ============================================================
   PAGES.JS — Skills, Certifications, Experience/Education,
              Contact page renderers
   ============================================================ */
(function () {
  'use strict';
  var P = window.Portfolio;

  /* ---------- Skills Page ---------- */
  function initSkills() {
    if (document.body.getAttribute('data-page') !== 'skills') return;
    P.loadData().then(function (data) {
      var grid = document.getElementById('skills-grid');
      if (!grid || !data.skills) return;

      if (data.skills.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p class="empty-state__text">No skills added yet.</p></div>';
        return;
      }

      grid.innerHTML = data.skills.map(function (cat) {
        return '<div class="skill-category reveal">' +
          '<h3 class="skill-category__title">' + P.escHtml(cat.category) + '</h3>' +
          cat.items.map(function (item) {
            return '<div class="skill-item">' +
              '<div class="skill-item__header">' +
                '<span class="skill-item__name">' + P.escHtml(item.name) + '</span>' +
                '<span class="skill-item__level">' + item.level + '%</span>' +
              '</div>' +
              '<div class="skill-bar">' +
                '<div class="skill-bar__fill" data-level="' + item.level + '"></div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>';
      }).join('');

      // Trigger skill bar animations
      setTimeout(function () { P.animateSkillBars(); }, 200);
    });
  }

  /* ---------- Certifications Page ---------- */
  function initCertifications() {
    if (document.body.getAttribute('data-page') !== 'certifications') return;
    P.loadData().then(function (data) {
      // Badge wall
      var badgeWall = document.getElementById('cert-badge-wall');
      if (badgeWall && data.badges) {
        badgeWall.innerHTML = data.badges.map(function (b) {
          var imgSrc = b.image ? P.asset(b.image) : '';
          return '<div class="badge-item">' +
            (imgSrc
              ? '<img class="badge-item__img" src="' + imgSrc + '" alt="' + P.escHtml(b.name) + '" loading="lazy">'
              : '<div class="badge-item__img-placeholder">' + P.escHtml(b.name) + '</div>') +
            '<span class="badge-item__name">' + P.escHtml(b.name) + '</span>' +
            '<span class="badge-item__issuer">' + P.escHtml(b.issuer) + '</span>' +
          '</div>';
        }).join('');
      }

      // Certificates grid
      var certGrid = document.getElementById('cert-grid');
      if (!certGrid || !data.certificates) return;

      if (data.certificates.length === 0) {
        certGrid.innerHTML = '<div class="empty-state"><p class="empty-state__text">No certificates added yet.</p></div>';
        return;
      }

      certGrid.innerHTML = data.certificates.map(function (cert, idx) {
        var imgSrc = cert.image ? P.asset(cert.image) : '';
        var verifyLink = cert.verifyUrl
          ? '<a class="cert-card__verify" href="' + P.escHtml(cert.verifyUrl) + '" target="_blank" rel="noopener">Verify ↗</a>'
          : '';
        return '<div class="cert-card reveal" data-cert-idx="' + idx + '">' +
          '<div class="cert-card__image">' +
            (imgSrc
              ? '<img src="' + imgSrc + '" alt="' + P.escHtml(cert.title) + '" loading="lazy">'
              : '<span class="card__thumb-placeholder">Certificate Image</span>') +
          '</div>' +
          '<div class="cert-card__body">' +
            '<h3 class="cert-card__title">' + P.escHtml(cert.title) + '</h3>' +
            '<p class="cert-card__issuer">' + P.escHtml(cert.issuer) + '</p>' +
            (cert.credentialId
              ? '<p style="font-size:0.75rem;color:var(--muted);font-family:var(--font-mono);margin-top:0.25rem;">ID: ' + P.escHtml(cert.credentialId) + '</p>'
              : '') +
            '<div class="cert-card__footer">' +
              '<span class="cert-card__date">' + P.escHtml(cert.date) + '</span>' +
              verifyLink +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      // Lightbox for certificate images
      var certImages = data.certificates.filter(function (c) { return c.image; }).map(function (c) { return c.image; });
      certGrid.querySelectorAll('.cert-card').forEach(function (card) {
        card.addEventListener('click', function (e) {
          if (e.target.closest('.cert-card__verify')) return; // Don't interfere with verify link
          var idx = parseInt(card.getAttribute('data-cert-idx'), 10);
          if (certImages.length > 0 && data.certificates[idx] && data.certificates[idx].image) {
            var imgIdx = certImages.indexOf(data.certificates[idx].image);
            if (imgIdx >= 0) P.lightbox.open(certImages, imgIdx);
          }
        });
      });
    });
  }

  /* ---------- Experience & Education Page ---------- */
  function initExperience() {
    if (document.body.getAttribute('data-page') !== 'experience') return;
    P.loadData().then(function (data) {
      var expTimeline = document.getElementById('exp-timeline');
      var eduTimeline = document.getElementById('edu-timeline');

      function renderTimeline(items, container) {
        if (!container) return;
        if (!items || items.length === 0) {
          container.innerHTML = '<div class="empty-state"><p class="empty-state__text">No entries added yet.</p><p class="empty-state__hint">Add entries via the admin page.</p></div>';
          return;
        }
        container.innerHTML = items.map(function (item) {
          var highlights = '';
          if (item.highlights && item.highlights.length > 0) {
            highlights = '<ul class="timeline-item__highlights">' +
              item.highlights.map(function (h) { return '<li>' + P.escHtml(h) + '</li>'; }).join('') +
            '</ul>';
          }
          return '<div class="timeline-item reveal">' +
            '<div class="timeline-item__dates">' + P.escHtml(item.startDate) + ' — ' + P.escHtml(item.endDate) + '</div>' +
            '<h3 class="timeline-item__title">' + P.escHtml(item.title) + '</h3>' +
            '<p class="timeline-item__org">' + P.escHtml(item.organization) + '</p>' +
            (item.location ? '<p class="timeline-item__location">' + P.escHtml(item.location) + '</p>' : '') +
            '<p class="timeline-item__desc">' + P.escHtml(item.description) + '</p>' +
            highlights +
          '</div>';
        }).join('');
      }

      renderTimeline(data.experience, expTimeline);
      renderTimeline(data.education, eduTimeline);
    });
  }

  /* ---------- Contact Page ---------- */
  function initContact() {
    if (document.body.getAttribute('data-page') !== 'contact') return;
    P.loadData().then(function (data) {
      var info = document.getElementById('contact-info');
      if (!info || !data.profile) return;

      var html = '';

      // Email
      if (data.profile.email) {
        html += '<div class="contact-item">' +
          '<div class="contact-item__icon">✉️</div>' +
          '<div>' +
            '<div class="contact-item__label">Email</div>' +
            '<div class="contact-item__value"><a href="mailto:' + P.escHtml(data.profile.email) + '">' + P.escHtml(data.profile.email) + '</a></div>' +
          '</div>' +
        '</div>';
      }

      // Location
      if (data.profile.location) {
        html += '<div class="contact-item">' +
          '<div class="contact-item__icon">📍</div>' +
          '<div>' +
            '<div class="contact-item__label">Location</div>' +
            '<div class="contact-item__value">' + P.escHtml(data.profile.location) + '</div>' +
          '</div>' +
        '</div>';
      }

      // LinkedIn
      if (data.links && data.links.linkedin) {
        html += '<div class="contact-item">' +
          '<div class="contact-item__icon">🔗</div>' +
          '<div>' +
            '<div class="contact-item__label">LinkedIn</div>' +
            '<div class="contact-item__value"><a href="' + P.escHtml(data.links.linkedin) + '" target="_blank" rel="noopener">' + P.escHtml(data.links.linkedin) + '</a></div>' +
          '</div>' +
        '</div>';
      }

      // GrabCAD
      if (data.links && data.links.grabcad) {
        html += '<div class="contact-item">' +
          '<div class="contact-item__icon">🔧</div>' +
          '<div>' +
            '<div class="contact-item__label">GrabCAD</div>' +
            '<div class="contact-item__value"><a href="' + P.escHtml(data.links.grabcad) + '" target="_blank" rel="noopener">' + P.escHtml(data.links.grabcad) + '</a></div>' +
          '</div>' +
        '</div>';
      }

      info.innerHTML = html;

      // Contact form (mailto-based, no backend)
      var form = document.getElementById('contact-form');
      if (form && data.profile.email) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var name = form.querySelector('[name="name"]').value.trim();
          var subject = form.querySelector('[name="subject"]').value.trim();
          var message = form.querySelector('[name="message"]').value.trim();
          if (!name || !message) {
            P.toast('Please fill in your name and message.', 'warning');
            return;
          }
          var mailto = 'mailto:' + data.profile.email +
            '?subject=' + encodeURIComponent(subject || 'Portfolio Contact') +
            '&body=' + encodeURIComponent('From: ' + name + '\n\n' + message);
          window.location.href = mailto;
          P.toast('Opening your email client...', 'info');
        });
      }
    });
  }

  /* ---------- Init ---------- */
  function init() {
    initSkills();
    initCertifications();
    initExperience();
    initContact();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
