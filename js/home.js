/* ============================================================
   HOME.JS — Hero animations (CFD, FEA, 3D modeling) + home page
   ============================================================ */
(function () {
  'use strict';

  var P = window.Portfolio;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     ANIMATION 1: CFD Streamlines
     ========================================================== */
  function initCFD(canvas) {
    var ctx = canvas.getContext('2d');
    var W, H, particles, obstacle;
    var running = true;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = rect.width * (window.devicePixelRatio > 1 ? 1.5 : 1);
      H = canvas.height = rect.height * (window.devicePixelRatio > 1 ? 1.5 : 1);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      obstacle = { x: W * 0.38, y: H * 0.5, r: Math.min(W, H) * 0.11 };
      initParticles();
    }

    var colors = ['#313695', '#4575B4', '#74ADD1', '#ABD9E9', '#FEE090', '#FDAE61', '#F46D43', '#D73027'];

    function initParticles() {
      particles = [];
      var count = Math.min(80, Math.floor(W * H / 3000));
      for (var i = 0; i < count; i++) {
        particles.push(makeParticle());
      }
    }

    function makeParticle() {
      return {
        x: Math.random() * W * 0.1,
        y: Math.random() * H,
        vx: 0.8 + Math.random() * 1.2,
        vy: 0,
        trail: [],
        maxTrail: 12 + Math.floor(Math.random() * 10)
      };
    }

    function getSpeed(p) {
      var dx = p.x - obstacle.x;
      var dy = p.y - obstacle.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var proximity = Math.max(0, 1 - dist / (obstacle.r * 4));
      return proximity;
    }

    function getColor(speed) {
      var idx = Math.min(colors.length - 1, Math.floor(speed * colors.length));
      return colors[idx];
    }

    function update() {
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var dx = p.x - obstacle.x;
        var dy = p.y - obstacle.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        // Deflect around obstacle
        if (dist < obstacle.r * 2.5) {
          var angle = Math.atan2(dy, dx);
          var deflect = (obstacle.r * 2.5 - dist) / (obstacle.r * 2.5);
          p.vy += Math.sin(angle) * deflect * 0.5;
          p.vx = Math.max(0.3, p.vx + Math.cos(angle) * deflect * 0.1);
        }

        // Dampen vy
        p.vy *= 0.96;
        p.vx = 0.8 + Math.random() * 0.3 + (dist < obstacle.r * 3 ? 0.5 : 0);

        p.x += p.vx;
        p.y += p.vy;

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.maxTrail) p.trail.shift();

        // Reset when off screen
        if (p.x > W + 10 || p.y < -20 || p.y > H + 20) {
          particles[i] = makeParticle();
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Draw obstacle
      ctx.beginPath();
      ctx.arc(obstacle.x, obstacle.y, obstacle.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(26, 29, 35, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(26, 29, 35, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw streamlines
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (p.trail.length < 2) continue;
        var speed = getSpeed(p);
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (var j = 1; j < p.trail.length; j++) {
          ctx.lineTo(p.trail[j].x, p.trail[j].y);
        }
        ctx.strokeStyle = getColor(speed);
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6 + speed * 0.4;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    function loop() {
      if (!running) return;
      update();
      draw();
      requestAnimationFrame(loop);
    }

    // Static frame for reduced motion
    function drawStatic() {
      resize();
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      ctx.arc(obstacle.x, obstacle.y, obstacle.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(26, 29, 35, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(26, 29, 35, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Draw static streamlines
      for (var i = 0; i < 12; i++) {
        var y = H * (0.15 + i * 0.06);
        ctx.beginPath();
        ctx.moveTo(0, y);
        var dy = y - obstacle.y;
        var deflection = Math.abs(dy) < obstacle.r * 2 ? (obstacle.r * 2 - Math.abs(dy)) * 0.3 * Math.sign(dy) : 0;
        ctx.bezierCurveTo(W * 0.25, y, obstacle.x, y + deflection, W, y + deflection * 0.5);
        var colorIdx = Math.min(colors.length - 1, Math.floor(Math.abs(deflection) / (obstacle.r * 0.6) * colors.length));
        ctx.strokeStyle = colors[colorIdx];
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    if (reducedMotion) {
      drawStatic();
      return { destroy: function () {} };
    }

    resize();
    window.addEventListener('resize', resize);
    loop();

    return {
      pause: function () { running = false; },
      resume: function () { if (!running) { running = true; loop(); } },
      destroy: function () { running = false; window.removeEventListener('resize', resize); }
    };
  }

  /* ==========================================================
     ANIMATION 2: FEA Stress Deformation
     ========================================================== */
  function initFEA(canvas) {
    var ctx = canvas.getContext('2d');
    var W, H;
    var running = true;
    var time = 0;
    var cols = 10, rows = 5;
    var stressColors = ['#313695', '#4575B4', '#74ADD1', '#ABD9E9', '#FEE090', '#FDAE61', '#F46D43', '#D73027', '#A50026'];

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = rect.width * (window.devicePixelRatio > 1 ? 1.5 : 1);
      H = canvas.height = rect.height * (window.devicePixelRatio > 1 ? 1.5 : 1);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }

    function getNode(col, row, t) {
      var marginX = W * 0.1;
      var marginY = H * 0.2;
      var cellW = (W - 2 * marginX) / cols;
      var cellH = (H - 2 * marginY) / rows;
      var x = marginX + col * cellW;
      var y = marginY + row * cellH;

      // Fixed left side, load on right
      var loadFactor = col / cols;
      var deform = Math.sin(t * 0.02) * loadFactor;
      var dx = deform * cellW * 0.3;
      var dy = deform * cellH * 0.5 * (row / rows - 0.5);

      return { x: x + dx, y: y + dy, stress: Math.abs(deform) * loadFactor };
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Draw fixed support markers on left
      var marginX = W * 0.1;
      var marginY = H * 0.2;
      for (var r = 0; r <= rows; r++) {
        var ny = marginY + r * ((H - 2 * marginY) / rows);
        ctx.beginPath();
        ctx.moveTo(marginX - 8, ny - 6);
        ctx.lineTo(marginX, ny);
        ctx.lineTo(marginX - 8, ny + 6);
        ctx.fillStyle = 'rgba(26, 29, 35, 0.3)';
        ctx.fill();
      }

      // Draw load arrow on right
      var arrowX = W - marginX + 15;
      var midY = H / 2;
      var arrowLen = 25 + Math.sin(time * 0.02) * 10;
      ctx.beginPath();
      ctx.moveTo(arrowX, midY - arrowLen);
      ctx.lineTo(arrowX, midY + arrowLen);
      ctx.strokeStyle = '#D73027';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(arrowX - 6, midY + arrowLen - 8);
      ctx.lineTo(arrowX, midY + arrowLen);
      ctx.lineTo(arrowX + 6, midY + arrowLen - 8);
      ctx.fillStyle = '#D73027';
      ctx.fill();
      ctx.font = (W > 300 ? '10' : '8') + 'px JetBrains Mono, monospace';
      ctx.fillStyle = '#D73027';
      ctx.textAlign = 'center';
      ctx.fillText('F', arrowX, midY - arrowLen - 6);

      // Draw mesh cells
      for (var c = 0; c < cols; c++) {
        for (var r2 = 0; r2 < rows; r2++) {
          var n00 = getNode(c, r2, time);
          var n10 = getNode(c + 1, r2, time);
          var n11 = getNode(c + 1, r2 + 1, time);
          var n01 = getNode(c, r2 + 1, time);
          var avgStress = (n00.stress + n10.stress + n11.stress + n01.stress) / 4;
          var colorIdx = Math.min(stressColors.length - 1, Math.floor(avgStress * stressColors.length * 1.5));

          // Fill cell
          ctx.beginPath();
          ctx.moveTo(n00.x, n00.y);
          ctx.lineTo(n10.x, n10.y);
          ctx.lineTo(n11.x, n11.y);
          ctx.lineTo(n01.x, n01.y);
          ctx.closePath();
          ctx.fillStyle = stressColors[colorIdx];
          ctx.globalAlpha = 0.25;
          ctx.fill();
          ctx.globalAlpha = 1;

          // Stroke cell edges (mesh lines)
          ctx.beginPath();
          ctx.moveTo(n00.x, n00.y);
          ctx.lineTo(n10.x, n10.y);
          ctx.lineTo(n11.x, n11.y);
          ctx.lineTo(n01.x, n01.y);
          ctx.closePath();
          ctx.strokeStyle = stressColors[colorIdx];
          ctx.globalAlpha = 0.5;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // Draw nodes
      for (var c2 = 0; c2 <= cols; c2++) {
        for (var r3 = 0; r3 <= rows; r3++) {
          var n = getNode(c2, r3, time);
          ctx.beginPath();
          ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(26, 29, 35, 0.3)';
          ctx.fill();
        }
      }
    }

    function loop() {
      if (!running) return;
      time++;
      draw();
      requestAnimationFrame(loop);
    }

    function drawStatic() {
      resize();
      time = 0;
      draw();
    }

    if (reducedMotion) {
      drawStatic();
      return { destroy: function () {} };
    }

    resize();
    window.addEventListener('resize', resize);
    loop();

    return {
      pause: function () { running = false; },
      resume: function () { if (!running) { running = true; loop(); } },
      destroy: function () { running = false; window.removeEventListener('resize', resize); }
    };
  }

  /* ==========================================================
     ANIMATION 3: 3D Modeling (sketch → extrude → rotate)
     ========================================================== */
  function init3DModeling(canvas) {
    var ctx = canvas.getContext('2d');
    var W, H;
    var running = true;
    var time = 0;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = rect.width * (window.devicePixelRatio > 1 ? 1.5 : 1);
      H = canvas.height = rect.height * (window.devicePixelRatio > 1 ? 1.5 : 1);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }

    // Simple 3D projection
    function project(x, y, z, rotY) {
      var cos = Math.cos(rotY), sin = Math.sin(rotY);
      var rx = x * cos - z * sin;
      var rz = x * sin + z * cos;
      var scale = 400 / (400 + rz);
      return {
        x: W / 2 + rx * scale,
        y: H / 2 + y * scale,
        scale: scale
      };
    }

    // L-shaped bracket profile
    var profilePts = [
      [-40, -30], [40, -30], [40, -10], [0, -10], [0, 30], [-40, 30]
    ];

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var cycle = (time * 0.005) % 3; // 0-1 sketch, 1-2 extrude, 2-3 rotate
      var phase, t;

      if (cycle < 1) { phase = 'sketch'; t = cycle; }
      else if (cycle < 2) { phase = 'extrude'; t = cycle - 1; }
      else { phase = 'rotate'; t = cycle - 2; }

      var rotY = phase === 'rotate' ? t * Math.PI * 0.6 + 0.3 : 0.3;
      var depth = phase === 'sketch' ? 0 : (phase === 'extrude' ? t * 60 : 60);
      var sketchProgress = phase === 'sketch' ? t : 1;

      var sz = Math.min(W, H) * 0.0035;

      // Draw grid (subtle)
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.06)';
      ctx.lineWidth = 0.5;
      for (var gx = -100; gx <= 100; gx += 20) {
        var p1 = project(gx * sz, 30 * sz, -100 * sz, rotY);
        var p2 = project(gx * sz, 30 * sz, 100 * sz, rotY);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
      for (var gz = -100; gz <= 100; gz += 20) {
        var p3 = project(-100 * sz, 30 * sz, gz * sz, rotY);
        var p4 = project(100 * sz, 30 * sz, gz * sz, rotY);
        ctx.beginPath(); ctx.moveTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.stroke();
      }

      // How many profile points to draw (animation)
      var totalPts = profilePts.length;
      var drawPts = Math.floor(sketchProgress * totalPts);
      if (drawPts < 2) drawPts = 2;

      // Draw front face
      ctx.beginPath();
      for (var i = 0; i < drawPts; i++) {
        var pt = profilePts[i];
        var proj = project(pt[0] * sz, pt[1] * sz, -depth / 2 * sz, rotY);
        if (i === 0) ctx.moveTo(proj.x, proj.y);
        else ctx.lineTo(proj.x, proj.y);
      }
      if (sketchProgress >= 1) ctx.closePath();
      ctx.fillStyle = 'rgba(37, 99, 235, 0.12)';
      if (sketchProgress >= 1) ctx.fill();
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw extruded solid
      if (depth > 0) {
        // Back face
        ctx.beginPath();
        for (var j = 0; j < totalPts; j++) {
          var pt2 = profilePts[j];
          var projB = project(pt2[0] * sz, pt2[1] * sz, depth / 2 * sz, rotY);
          if (j === 0) ctx.moveTo(projB.x, projB.y);
          else ctx.lineTo(projB.x, projB.y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Side edges
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.3)';
        ctx.lineWidth = 1;
        for (var k = 0; k < totalPts; k++) {
          var ptS = profilePts[k];
          var pF = project(ptS[0] * sz, ptS[1] * sz, -depth / 2 * sz, rotY);
          var pB = project(ptS[0] * sz, ptS[1] * sz, depth / 2 * sz, rotY);
          ctx.beginPath();
          ctx.moveTo(pF.x, pF.y);
          ctx.lineTo(pB.x, pB.y);
          ctx.stroke();
        }

        // Top face (visible surfaces)
        var topEdges = [[0, 1], [1, 2]]; // top edges of the L
        ctx.fillStyle = 'rgba(37, 99, 235, 0.18)';
        for (var te = 0; te < topEdges.length; te++) {
          var ei = topEdges[te];
          var a1 = project(profilePts[ei[0]][0] * sz, profilePts[ei[0]][1] * sz, -depth / 2 * sz, rotY);
          var a2 = project(profilePts[ei[1]][0] * sz, profilePts[ei[1]][1] * sz, -depth / 2 * sz, rotY);
          var b1 = project(profilePts[ei[0]][0] * sz, profilePts[ei[0]][1] * sz, depth / 2 * sz, rotY);
          var b2 = project(profilePts[ei[1]][0] * sz, profilePts[ei[1]][1] * sz, depth / 2 * sz, rotY);
          ctx.beginPath();
          ctx.moveTo(a1.x, a1.y);
          ctx.lineTo(a2.x, a2.y);
          ctx.lineTo(b2.x, b2.y);
          ctx.lineTo(b1.x, b1.y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(37, 99, 235, 0.3)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Sketch construction lines during sketch phase
      if (phase === 'sketch') {
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.15)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 0.5;
        // Horizontal and vertical construction lines
        var cx = project(0, 0, 0, rotY);
        ctx.beginPath(); ctx.moveTo(cx.x - 60, cx.y); ctx.lineTo(cx.x + 60, cx.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx.x, cx.y - 60); ctx.lineTo(cx.x, cx.y + 60); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Dimension annotation during extrude
      if (phase === 'extrude' && depth > 10) {
        var dimStart = project(45 * sz, -30 * sz, -depth / 2 * sz, rotY);
        var dimEnd = project(45 * sz, -30 * sz, depth / 2 * sz, rotY);
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dimStart.x, dimStart.y);
        ctx.lineTo(dimEnd.x, dimEnd.y);
        ctx.stroke();
        // Arrows
        ctx.fillStyle = 'rgba(37, 99, 235, 0.5)';
        ctx.beginPath();
        ctx.arc(dimStart.x, dimStart.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dimEnd.x, dimEnd.y, 2, 0, Math.PI * 2);
        ctx.fill();
        // Label
        var mid = { x: (dimStart.x + dimEnd.x) / 2, y: (dimStart.y + dimEnd.y) / 2 - 10 };
        ctx.font = (W > 300 ? '9' : '7') + 'px JetBrains Mono, monospace';
        ctx.fillStyle = '#2563EB';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(depth) + ' mm', mid.x, mid.y);
      }
    }

    function loop() {
      if (!running) return;
      time++;
      draw();
      requestAnimationFrame(loop);
    }

    function drawStatic() {
      resize();
      time = 400; // mid-extrude
      draw();
    }

    if (reducedMotion) {
      drawStatic();
      return { destroy: function () {} };
    }

    resize();
    window.addEventListener('resize', resize);
    loop();

    return {
      pause: function () { running = false; },
      resume: function () { if (!running) { running = true; loop(); } },
      destroy: function () { running = false; window.removeEventListener('resize', resize); }
    };
  }

  /* ==========================================================
     THREE-SCENE HERO BACKGROUND ANIMATION
     Scene 1: Rotating Mechanical Gear (0-5s)
     Scene 2: Drone CFD Simulation (5-10s)
     Scene 3: Structural FEA Visualization (10-15s)
     ========================================================== */
  function initHeroBackground(container) {
    var canvas = document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var W, H, dpr;
    var running = true;
    var startTime = performance.now();
    var CYCLE = 15000;       // 15 seconds per full cycle
    var SCENE_DUR = 5000;    // 5 seconds per scene
    var FADE = 800;          // 0.8s crossfade

    // Color palette
    var C = {
      bg: '#F7F8FA',
      primary: '#1F4E79',
      accent: '#2563EB',
      silver: '#B0BEC5',
      lightBlue: '#DCEAF8',
      paleBlue: '#E8EFF6',
      cyan: '#4DD0E1',
      grid: 'rgba(31, 78, 121, 0.06)',
      blueprint: 'rgba(31, 78, 121, 0.04)',
      // Stress contour
      stressBlue: '#4575B4',
      stressCyan: '#74ADD1',
      stressGreen: '#ABD9E9',
      stressYellow: '#FEE090',
      stressOrange: '#FDAE61',
      stressRed: '#F46D43'
    };

    function resize() {
      var rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = Math.round(rect.width * dpr);
      H = canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }

    function getSceneOpacity(t, sceneIdx) {
      var sceneStart = sceneIdx * SCENE_DUR;
      var sceneEnd = sceneStart + SCENE_DUR;
      var tMod = t % CYCLE;

      // Handle wrap-around for scene 2 (last scene fading into first)
      if (sceneIdx === 0 && tMod > CYCLE - FADE) {
        return Math.min(1, (tMod - (CYCLE - FADE)) / FADE);
      }

      if (tMod < sceneStart - FADE || tMod > sceneEnd + FADE) return 0;
      if (tMod < sceneStart) return 0;

      var opacity = 1;
      // Fade in
      if (tMod < sceneStart + FADE) {
        opacity = (tMod - sceneStart) / FADE;
      }
      // Fade out
      if (tMod > sceneEnd - FADE) {
        opacity = Math.max(0, 1 - (tMod - (sceneEnd - FADE)) / FADE);
      }
      return Math.max(0, Math.min(1, opacity));
    }

    /* -------- SCENE 1: Mechanical Gear -------- */
    function drawGear(t, alpha) {
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;

      var cx = W * 0.52;
      var cy = H * 0.48;
      var baseR = Math.min(W, H) * 0.34;
      var rotation = (t / 1000) * 0.15; // slow rotation

      // Blueprint concentric circles
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1 * dpr;
      for (var rr = 0.15; rr <= 0.55; rr += 0.1) {
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * rr, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Cross-hair lines
      ctx.strokeStyle = C.blueprint;
      ctx.setLineDash([6 * dpr, 6 * dpr]);
      ctx.beginPath();
      ctx.moveTo(cx - baseR * 0.6, cy);
      ctx.lineTo(cx + baseR * 0.6, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - baseR * 0.6);
      ctx.lineTo(cx, cy + baseR * 0.6);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);

      // Main gear body
      var teeth = 18;
      var outerR = baseR * 0.44;
      var innerR = baseR * 0.36;
      var tipR = baseR * 0.46;

      // Gear teeth path
      ctx.beginPath();
      for (var i = 0; i < teeth; i++) {
        var a0 = (i / teeth) * Math.PI * 2;
        var a1 = ((i + 0.2) / teeth) * Math.PI * 2;
        var a2 = ((i + 0.3) / teeth) * Math.PI * 2;
        var a3 = ((i + 0.5) / teeth) * Math.PI * 2;
        var a4 = ((i + 0.7) / teeth) * Math.PI * 2;
        var a5 = ((i + 0.8) / teeth) * Math.PI * 2;

        if (i === 0) {
          ctx.moveTo(innerR * Math.cos(a0), innerR * Math.sin(a0));
        } else {
          ctx.lineTo(innerR * Math.cos(a0), innerR * Math.sin(a0));
        }
        ctx.lineTo(outerR * Math.cos(a1), outerR * Math.sin(a1));
        ctx.lineTo(tipR * Math.cos(a2), tipR * Math.sin(a2));
        ctx.lineTo(tipR * Math.cos(a3), tipR * Math.sin(a3));
        ctx.lineTo(outerR * Math.cos(a4), outerR * Math.sin(a4));
        ctx.lineTo(innerR * Math.cos(a5), innerR * Math.sin(a5));
      }
      ctx.closePath();

      // Gradient fill
      var gearGrad = ctx.createRadialGradient(0, 0, baseR * 0.1, 0, 0, tipR);
      gearGrad.addColorStop(0, 'rgba(31, 78, 121, 0.08)');
      gearGrad.addColorStop(0.7, 'rgba(31, 78, 121, 0.04)');
      gearGrad.addColorStop(1, 'rgba(31, 78, 121, 0.02)');
      ctx.fillStyle = gearGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(31, 78, 121, 0.15)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      // Hub hole
      var holeR = baseR * 0.12;
      ctx.beginPath();
      ctx.arc(0, 0, holeR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(31, 78, 121, 0.18)';
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();

      // Hub circle
      ctx.beginPath();
      ctx.arc(0, 0, baseR * 0.07, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(31, 78, 121, 0.05)';
      ctx.fill();

      // Keyway
      ctx.fillStyle = 'rgba(31, 78, 121, 0.08)';
      ctx.fillRect(-2 * dpr, -holeR, 4 * dpr, holeR);

      // Spokes
      ctx.strokeStyle = 'rgba(31, 78, 121, 0.08)';
      ctx.lineWidth = 3 * dpr;
      for (var s = 0; s < 6; s++) {
        var sa = (s / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(holeR * 1.3 * Math.cos(sa), holeR * 1.3 * Math.sin(sa));
        ctx.lineTo(innerR * 0.85 * Math.cos(sa), innerR * 0.85 * Math.sin(sa));
        ctx.stroke();
      }

      ctx.restore();

      // Second smaller gear (meshing)
      var cx2 = cx + outerR * 1.3;
      var cy2 = cy - outerR * 0.6;
      var scale2 = 0.55;
      ctx.save();
      ctx.translate(cx2, cy2);
      ctx.rotate(-rotation * (1 / scale2) + 0.15); // counter-rotate with ratio

      var teeth2 = 12;
      var oR2 = outerR * scale2 * 0.95;
      var iR2 = innerR * scale2 * 0.95;
      var tR2 = tipR * scale2 * 0.95;

      ctx.beginPath();
      for (var j = 0; j < teeth2; j++) {
        var b0 = (j / teeth2) * Math.PI * 2;
        var b1 = ((j + 0.2) / teeth2) * Math.PI * 2;
        var b2 = ((j + 0.3) / teeth2) * Math.PI * 2;
        var b3 = ((j + 0.5) / teeth2) * Math.PI * 2;
        var b4 = ((j + 0.7) / teeth2) * Math.PI * 2;
        var b5 = ((j + 0.8) / teeth2) * Math.PI * 2;
        if (j === 0) ctx.moveTo(iR2 * Math.cos(b0), iR2 * Math.sin(b0));
        else ctx.lineTo(iR2 * Math.cos(b0), iR2 * Math.sin(b0));
        ctx.lineTo(oR2 * Math.cos(b1), oR2 * Math.sin(b1));
        ctx.lineTo(tR2 * Math.cos(b2), tR2 * Math.sin(b2));
        ctx.lineTo(tR2 * Math.cos(b3), tR2 * Math.sin(b3));
        ctx.lineTo(oR2 * Math.cos(b4), oR2 * Math.sin(b4));
        ctx.lineTo(iR2 * Math.cos(b5), iR2 * Math.sin(b5));
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(31, 78, 121, 0.05)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(31, 78, 121, 0.12)';
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();

      // Hub
      ctx.beginPath();
      ctx.arc(0, 0, baseR * 0.06, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(31, 78, 121, 0.15)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      ctx.restore();

      // Dimension label
      ctx.save();
      ctx.font = (9 * dpr) + 'px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(31, 78, 121, 0.2)';
      ctx.textAlign = 'center';
      ctx.fillText('Module 2.5 · 18T', cx, cy + outerR + 20 * dpr);
      ctx.restore();

      ctx.restore();
    }

    /* -------- SCENE 2: Drone CFD -------- */
    var flowParticles = [];
    function initFlowParticles() {
      flowParticles = [];
      for (var i = 0; i < 60; i++) {
        flowParticles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: -0.3 - Math.random() * 0.6,
          vy: 0.2 + Math.random() * 0.5,
          life: Math.random(),
          maxLife: 0.6 + Math.random() * 0.4
        });
      }
    }

    function drawDroneCFD(t, alpha) {
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;

      var cx = W * 0.52;
      var cy = H * 0.45;
      var sz = Math.min(W, H) * 0.28;

      // Drone body
      var armLen = sz * 0.45;
      var bodyR = sz * 0.1;
      var motorR = sz * 0.065;
      var propR = sz * 0.18;
      var armAngles = [-0.6, 0.6, Math.PI - 0.6, Math.PI + 0.6];
      var propAngle = (t / 1000) * 8;

      // Faint computational mesh background
      ctx.strokeStyle = 'rgba(31, 78, 121, 0.03)';
      ctx.lineWidth = 0.5 * dpr;
      var meshStep = sz * 0.08;
      for (var mx = cx - sz; mx <= cx + sz; mx += meshStep) {
        ctx.beginPath();
        ctx.moveTo(mx, cy - sz * 0.7);
        ctx.lineTo(mx, cy + sz * 0.7);
        ctx.stroke();
      }
      for (var my = cy - sz * 0.7; my <= cy + sz * 0.7; my += meshStep) {
        ctx.beginPath();
        ctx.moveTo(cx - sz, my);
        ctx.lineTo(cx + sz, my);
        ctx.stroke();
      }

      // Pressure contour (faint oval)
      var pressGrad = ctx.createRadialGradient(cx, cy, bodyR, cx, cy, sz * 0.7);
      pressGrad.addColorStop(0, 'rgba(77, 208, 225, 0.06)');
      pressGrad.addColorStop(0.4, 'rgba(37, 99, 235, 0.03)');
      pressGrad.addColorStop(1, 'rgba(31, 78, 121, 0.0)');
      ctx.fillStyle = pressGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, sz * 0.7, sz * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Arms
      ctx.strokeStyle = 'rgba(31, 78, 121, 0.15)';
      ctx.lineWidth = 2.5 * dpr;
      ctx.lineCap = 'round';
      for (var ai = 0; ai < armAngles.length; ai++) {
        var ax = cx + armLen * Math.cos(armAngles[ai]);
        var ay = cy + armLen * Math.sin(armAngles[ai]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ax, ay);
        ctx.stroke();

        // Motor housing
        ctx.beginPath();
        ctx.arc(ax, ay, motorR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(31, 78, 121, 0.06)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(31, 78, 121, 0.12)';
        ctx.lineWidth = 1.5 * dpr;
        ctx.stroke();

        // Spinning propeller (disc effect)
        ctx.beginPath();
        ctx.arc(ax, ay, propR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(37, 99, 235, 0.03)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.08)';
        ctx.lineWidth = 0.8 * dpr;
        ctx.setLineDash([3 * dpr, 3 * dpr]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Prop blades (motion blur)
        var direction = ai < 2 ? 1 : -1;
        for (var blade = 0; blade < 2; blade++) {
          var ba = propAngle * direction + blade * Math.PI;
          ctx.beginPath();
          ctx.moveTo(ax - propR * 0.9 * Math.cos(ba), ay - propR * 0.9 * Math.sin(ba));
          ctx.lineTo(ax + propR * 0.9 * Math.cos(ba), ay + propR * 0.9 * Math.sin(ba));
          ctx.strokeStyle = 'rgba(31, 78, 121, 0.1)';
          ctx.lineWidth = 2 * dpr;
          ctx.stroke();
        }
      }

      // Body frame
      ctx.beginPath();
      ctx.arc(cx, cy, bodyR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(31, 78, 121, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(31, 78, 121, 0.18)';
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();

      // Inner body detail
      ctx.beginPath();
      ctx.arc(cx, cy, bodyR * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(31, 78, 121, 0.1)';
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();

      // Airflow streamlines
      if (flowParticles.length === 0) initFlowParticles();
      ctx.lineWidth = 1 * dpr;
      ctx.lineCap = 'round';
      for (var fi = 0; fi < flowParticles.length; fi++) {
        var fp = flowParticles[fi];
        fp.x += fp.vx * dpr;
        fp.y += fp.vy * dpr;
        fp.life -= 0.003;

        // Deflect near drone
        var fdx = fp.x - cx;
        var fdy = fp.y - cy;
        var fdist = Math.sqrt(fdx * fdx + fdy * fdy);
        if (fdist < sz * 0.5 && fdist > 0) {
          fp.vx += (fdx / fdist) * 0.04;
          fp.vy += (fdy / fdist) * 0.06;
          // Downwash effect beneath motors
          if (fdy > 0) fp.vy += 0.15;
        }
        fp.vy *= 0.99;
        fp.vx *= 0.99;

        // Reset
        if (fp.life <= 0 || fp.x < 0 || fp.x > W || fp.y > H || fp.y < 0) {
          fp.x = cx + (Math.random() - 0.5) * sz * 2;
          fp.y = cy - sz * 0.6 - Math.random() * sz * 0.3;
          fp.vx = -0.3 + Math.random() * 0.6;
          fp.vy = 0.2 + Math.random() * 0.4;
          fp.life = fp.maxLife;
        }

        var particleAlpha = fp.life / fp.maxLife;
        // Color by speed
        var speed = Math.sqrt(fp.vx * fp.vx + fp.vy * fp.vy);
        var hue = 200 - speed * 30; // blue to cyan
        ctx.strokeStyle = 'hsla(' + hue + ', 60%, 55%, ' + (particleAlpha * 0.3) + ')';
        ctx.beginPath();
        ctx.moveTo(fp.x, fp.y);
        ctx.lineTo(fp.x - fp.vx * 8, fp.y - fp.vy * 8);
        ctx.stroke();
      }

      // Label
      ctx.font = (9 * dpr) + 'px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(31, 78, 121, 0.18)';
      ctx.textAlign = 'center';
      ctx.fillText('CFD · Velocity Contour', cx, cy + sz * 0.85);

      ctx.restore();
    }

    /* -------- SCENE 3: Structural FEA -------- */
    function drawFEA(t, alpha) {
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;

      var cx = W * 0.5;
      var cy = H * 0.48;
      var sz = Math.min(W, H) * 0.38;
      var deformTime = (t % 6000) / 6000;
      var deformAmt = Math.sin(deformTime * Math.PI * 2) * 0.5 + 0.5; // 0 to 1

      // L-bracket shape (nodes define the structure)
      var bracketW = sz * 0.9;
      var bracketH = sz * 0.8;

      var cols = 14, rows = 12;
      var nodes = [];

      // Generate mesh nodes for L-shaped bracket
      for (var row = 0; row <= rows; row++) {
        nodes[row] = [];
        for (var col = 0; col <= cols; col++) {
          var nx = cx - bracketW * 0.4 + (col / cols) * bracketW;
          var ny = cy - bracketH * 0.4 + (row / rows) * bracketH;

          // L-shape mask: exclude top-right quadrant
          var inShape = true;
          var relX = col / cols;
          var relY = row / rows;
          if (relX > 0.45 && relY < 0.5) inShape = false;

          // Apply deformation (load from right side, fixed at bottom-left)
          var dx = 0, dy = 0;
          var distFromFixed = relX;
          if (inShape) {
            var loadEffect = distFromFixed * deformAmt;
            dx = loadEffect * sz * 0.03;
            dy = loadEffect * relY * sz * 0.05 * deformAmt;
          }

          nodes[row][col] = {
            x: nx + dx,
            y: ny + dy,
            inShape: inShape,
            stress: inShape ? distFromFixed * (1 - relY * 0.3) : 0
          };
        }
      }

      // Draw mesh elements
      for (var mr = 0; mr < rows; mr++) {
        for (var mc = 0; mc < cols; mc++) {
          var n0 = nodes[mr][mc];
          var n1 = nodes[mr][mc + 1];
          var n2 = nodes[mr + 1][mc + 1];
          var n3 = nodes[mr + 1][mc];

          if (!n0.inShape || !n1.inShape || !n2.inShape || !n3.inShape) continue;

          var avgStress = (n0.stress + n1.stress + n2.stress + n3.stress) / 4;

          // Stress color: blue → cyan → green → yellow → orange → red
          var stressColor = getStressColor(avgStress * deformAmt);

          ctx.beginPath();
          ctx.moveTo(n0.x, n0.y);
          ctx.lineTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.lineTo(n3.x, n3.y);
          ctx.closePath();
          ctx.fillStyle = stressColor;
          ctx.fill();

          // Mesh lines
          ctx.strokeStyle = 'rgba(31, 78, 121, 0.08)';
          ctx.lineWidth = 0.5 * dpr;
          ctx.stroke();
        }
      }

      // Outline the bracket
      ctx.strokeStyle = 'rgba(31, 78, 121, 0.15)';
      ctx.lineWidth = 1.5 * dpr;
      // Trace the outer boundary
      var boundary = [];
      // Bottom edge
      for (var bc = 0; bc <= cols; bc++) {
        if (nodes[rows][bc].inShape) boundary.push(nodes[rows][bc]);
      }
      if (boundary.length > 1) {
        ctx.beginPath();
        ctx.moveTo(boundary[0].x, boundary[0].y);
        for (var bi = 1; bi < boundary.length; bi++) {
          ctx.lineTo(boundary[bi].x, boundary[bi].y);
        }
        ctx.stroke();
      }

      // Fixed support symbol (hatching at left)
      var fixX = cx - bracketW * 0.4;
      var fixY1 = cy - bracketH * 0.4;
      var fixY2 = cy + bracketH * 0.4;
      ctx.strokeStyle = 'rgba(31, 78, 121, 0.12)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.moveTo(fixX, fixY1 + bracketH * 0.3);
      ctx.lineTo(fixX, fixY2);
      ctx.stroke();
      // Hatches
      for (var hy = fixY1 + bracketH * 0.3; hy <= fixY2; hy += 8 * dpr) {
        ctx.beginPath();
        ctx.moveTo(fixX, hy);
        ctx.lineTo(fixX - 8 * dpr, hy + 8 * dpr);
        ctx.stroke();
      }

      // Load arrow
      var arrowX = cx + bracketW * 0.35;
      var arrowY = cy + bracketH * 0.05;
      ctx.strokeStyle = 'rgba(212, 48, 39, 0.25)';
      ctx.fillStyle = 'rgba(212, 48, 39, 0.25)';
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY - sz * 0.2);
      ctx.lineTo(arrowX, arrowY + sz * 0.05);
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY + sz * 0.08);
      ctx.lineTo(arrowX - 5 * dpr, arrowY);
      ctx.lineTo(arrowX + 5 * dpr, arrowY);
      ctx.closePath();
      ctx.fill();
      // Force label
      ctx.font = (8 * dpr) + 'px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(212, 48, 39, 0.3)';
      ctx.textAlign = 'center';
      ctx.fillText('F = 500 N', arrowX, arrowY - sz * 0.23);

      // Color legend
      var legendX = cx + bracketW * 0.15;
      var legendY = cy + bracketH * 0.52;
      var legendW = sz * 0.5;
      var legendH = 5 * dpr;
      var legGrad = ctx.createLinearGradient(legendX, legendY, legendX + legendW, legendY);
      legGrad.addColorStop(0, 'rgba(69, 117, 180, 0.3)');
      legGrad.addColorStop(0.25, 'rgba(116, 173, 209, 0.3)');
      legGrad.addColorStop(0.5, 'rgba(254, 224, 144, 0.3)');
      legGrad.addColorStop(0.75, 'rgba(253, 174, 97, 0.3)');
      legGrad.addColorStop(1, 'rgba(244, 109, 67, 0.3)');
      ctx.fillStyle = legGrad;
      ctx.fillRect(legendX, legendY, legendW, legendH);
      ctx.strokeStyle = 'rgba(31, 78, 121, 0.1)';
      ctx.lineWidth = 0.5 * dpr;
      ctx.strokeRect(legendX, legendY, legendW, legendH);

      ctx.font = (7 * dpr) + 'px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(31, 78, 121, 0.2)';
      ctx.textAlign = 'left';
      ctx.fillText('0 MPa', legendX, legendY + legendH + 10 * dpr);
      ctx.textAlign = 'right';
      ctx.fillText('250 MPa', legendX + legendW, legendY + legendH + 10 * dpr);
      ctx.textAlign = 'center';
      ctx.fillText('Von Mises Stress', legendX + legendW / 2, legendY - 5 * dpr);

      ctx.restore();
    }

    function getStressColor(stress) {
      stress = Math.max(0, Math.min(1, stress));
      var stops = [
        [0, 69, 117, 180],    // blue
        [0.2, 116, 173, 209], // light blue
        [0.4, 171, 217, 233], // cyan
        [0.55, 254, 224, 144],// yellow
        [0.75, 253, 174, 97], // orange
        [1.0, 244, 109, 67]   // red
      ];

      for (var si = 0; si < stops.length - 1; si++) {
        if (stress >= stops[si][0] && stress <= stops[si + 1][0]) {
          var t2 = (stress - stops[si][0]) / (stops[si + 1][0] - stops[si][0]);
          var r = Math.round(stops[si][1] + (stops[si + 1][1] - stops[si][1]) * t2);
          var g = Math.round(stops[si][2] + (stops[si + 1][2] - stops[si][2]) * t2);
          var b = Math.round(stops[si][3] + (stops[si + 1][3] - stops[si][3]) * t2);
          return 'rgba(' + r + ',' + g + ',' + b + ', 0.12)';
        }
      }
      return 'rgba(244, 109, 67, 0.12)';
    }

    /* -------- Main render loop -------- */
    function frame(now) {
      if (!running) return;
      var elapsed = now - startTime;

      ctx.clearRect(0, 0, W, H);

      var a1 = getSceneOpacity(elapsed, 0);
      var a2 = getSceneOpacity(elapsed, 1);
      var a3 = getSceneOpacity(elapsed, 2);

      drawGear(elapsed, a1);
      drawDroneCFD(elapsed, a2);
      drawFEA(elapsed, a3);

      requestAnimationFrame(frame);
    }

    /* -------- Static fallback for reduced motion -------- */
    function drawStatic() {
      resize();
      ctx.clearRect(0, 0, W, H);
      drawGear(0, 0.8);
    }

    if (reducedMotion) {
      drawStatic();
      return { destroy: function () {} };
    }

    resize();
    initFlowParticles();
    window.addEventListener('resize', function () {
      resize();
      initFlowParticles();
    });
    requestAnimationFrame(frame);

    return {
      pause: function () { running = false; },
      resume: function () { if (!running) { running = true; requestAnimationFrame(frame); } },
      destroy: function () { running = false; }
    };
  }

  /* ==========================================================
     Visibility observer — pause off-screen animations
     ========================================================== */
  function observeVisibility(el, anim) {
    if (!anim || !anim.pause) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) anim.resume();
        else anim.pause();
      });
    }, { threshold: 0.05 });
    obs.observe(el);
  }

  /* ==========================================================
     Home page initialization
     ========================================================== */
  function initHomePage() {
    var P2 = window.Portfolio;

    P2.loadData().then(function (data) {
      // Hero content
      var heroTitle = document.getElementById('hero-title');
      var heroSub = document.getElementById('hero-subtitle');
      if (heroTitle && data.profile) {
        heroTitle.innerHTML =
          'Design.<br><span class="accent">Simulate.</span><br>Validate.';
      }
      if (heroSub && data.profile) {
        heroSub.textContent = data.profile.heroSubtitle || data.profile.tagline || '';
      }

      // Hero background animation (three-scene: gear, drone CFD, FEA)
      var gearContainer = document.querySelector('.gear-container');
      if (gearContainer) {
        var heroAnim = initHeroBackground(gearContainer);
        observeVisibility(gearContainer, heroAnim);
      }

      // Expertise animations
      var cfdCanvas = document.getElementById('cfd-canvas');
      var feaCanvas = document.getElementById('fea-canvas');
      var cadCanvas = document.getElementById('cad-canvas');

      if (cfdCanvas) {
        var cfdAnim = initCFD(cfdCanvas);
        observeVisibility(cfdCanvas.parentElement, cfdAnim);
      }
      if (feaCanvas) {
        var feaAnim = initFEA(feaCanvas);
        observeVisibility(feaCanvas.parentElement, feaAnim);
      }
      if (cadCanvas) {
        var cadAnim = init3DModeling(cadCanvas);
        observeVisibility(cadCanvas.parentElement, cadAnim);
      }

      // Featured designs
      var featDesigns = (data.designs || []).filter(function (d) { return d.featured; });
      var featSims = (data.simulations || []).filter(function (s) { return s.featured; });

      var designsGrid = document.getElementById('featured-designs-grid');
      if (designsGrid) {
        if (featDesigns.length === 0) {
          designsGrid.innerHTML = '<div class="empty-state"><p class="empty-state__text">No featured designs yet.</p><p class="empty-state__hint">Add designs via the admin page and mark them as featured.</p></div>';
        } else {
          designsGrid.innerHTML = featDesigns.map(function (d) {
            return P2.renderCard(d, 'design');
          }).join('');
        }
      }

      var simsGrid = document.getElementById('featured-sims-grid');
      if (simsGrid) {
        if (featSims.length === 0) {
          simsGrid.innerHTML = '<div class="empty-state"><p class="empty-state__text">No featured simulations yet.</p><p class="empty-state__hint">Add simulations via the admin page and mark them as featured.</p></div>';
        } else {
          simsGrid.innerHTML = featSims.map(function (s) {
            return P2.renderCard(s, 'simulation');
          }).join('');
        }
      }

      // Badge wall
      var badgeWall = document.getElementById('badge-wall');
      if (badgeWall && data.badges) {
        if (data.badges.length === 0) {
          badgeWall.innerHTML = '<div class="empty-state"><p class="empty-state__text">No badges added yet.</p></div>';
        } else {
          badgeWall.innerHTML = data.badges.map(function (b) {
            var esc = P2.escHtml;
            var imgSrc = b.image ? P2.asset(b.image) : '';
            return '<div class="badge-item">' +
              (imgSrc
                ? '<img class="badge-item__img" src="' + imgSrc + '" alt="' + esc(b.name) + ' badge" loading="lazy">'
                : '<div class="badge-item__img-placeholder">' + esc(b.name) + '</div>') +
              '<span class="badge-item__name">' + esc(b.name) + '</span>' +
              '<span class="badge-item__issuer">' + esc(b.issuer) + '</span>' +
            '</div>';
          }).join('');
        }
      }

      // Stats bar
      var statsDesigns = document.getElementById('stat-designs');
      var statsSims = document.getElementById('stat-sims');
      var statsCerts = document.getElementById('stat-certs');
      if (statsDesigns) statsDesigns.textContent = String(data.designs ? data.designs.length : 0).padStart(2, '0');
      if (statsSims) statsSims.textContent = String(data.simulations ? data.simulations.length : 0).padStart(2, '0');
      if (statsCerts) statsCerts.textContent = String(data.badges ? data.badges.length : 0).padStart(2, '0');

    }).catch(function (err) {
      console.error('Failed to load portfolio data:', err);
    });
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomePage);
  } else {
    initHomePage();
  }

})();
