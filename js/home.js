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
     CINEMATIC SUPERSONIC ROCKET CFD SIMULATION
     - Text-free, purely graphical engineering visualization
     - 3/4 perspective, diagonal orientation (nose upper-right, exhaust lower-left)
     - Scaled down by ~25% to fit safely within container with ample padding
     - Zero clipping on nose, fins, bow shock, or exhaust plume
     - Mach bow shock, streamline particle flow, De Laval shock diamonds
     - Phases: Reveal -> 3D Inspection -> CFD Flow -> Engine Plume -> Seamless Loop
     ========================================================== */
  function initHeroBackground(container) {
    var canvas = document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var W, H, dpr;
    var running = true;
    var startTime = performance.now();

    // 20-second continuous cycle
    var CYCLE = 20000;
    // Phases (ms): 0: Reveal(3.5s), 1: 3D Inspection(4.5s), 2: CFD Flow(4.5s), 3: Ignition(5.0s), 4: Seamless Loop Fade(2.5s)
    var PHASES = [3500, 4500, 4500, 5000, 2500];
    var PHASE_STARTS = [];
    (function () {
      var s = 0;
      for (var i = 0; i < PHASES.length; i++) {
        PHASE_STARTS.push(s);
        s += PHASES[i];
      }
    })();

    // ---- Particle Systems ----
    var flowParticles = [];
    var exhaustParticles = [];
    var sparkParticles = [];
    var MAX_FLOW = 50;
    var MAX_EXHAUST = 55;
    var MAX_SPARKS = 25;

    function resize() {
      var rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = Math.round(rect.width * dpr);
      H = canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      initParticlePools();
    }

    // Diagonal unit vectors for flow along the flight axis
    // Flight direction: pointing upper-right (~28 degrees above horizontal)
    var FLIGHT_ANGLE = 28 * Math.PI / 180;
    var DIR_FLIGHT_X = Math.cos(FLIGHT_ANGLE);
    var DIR_FLIGHT_Y = -Math.sin(FLIGHT_ANGLE); // upward in canvas is negative Y

    // Oncoming airflow moves in the opposite direction (from upper-right to lower-left)
    var DIR_FLOW_X = -DIR_FLIGHT_X;
    var DIR_FLOW_Y = -DIR_FLIGHT_Y; // downward in canvas is positive Y

    function initParticlePools() {
      flowParticles = [];
      for (var i = 0; i < MAX_FLOW; i++) {
        flowParticles.push(createFlowParticle(true));
      }
      exhaustParticles = [];
      for (var j = 0; j < MAX_EXHAUST; j++) {
        exhaustParticles.push(createExhaustParticle());
      }
      sparkParticles = [];
      for (var k = 0; k < MAX_SPARKS; k++) {
        sparkParticles.push(createSparkParticle());
      }
    }

    function createFlowParticle(randomProgress) {
      // Streamline offset lateral to flight path
      var lateralOffset = (Math.random() - 0.5) * H * 0.9;
      // Normal to flow direction: (-DIR_FLOW_Y, DIR_FLOW_X)
      var normX = -DIR_FLOW_Y;
      var normY = DIR_FLOW_X;

      // Spawn along upper-right entry envelope
      var distAlongPath = randomProgress ? Math.random() * (W + H) : (W + H) * 0.55 + Math.random() * 80;
      var cx0 = W * 0.50;
      var cy0 = H * 0.48;

      var px = cx0 - DIR_FLOW_X * distAlongPath + normX * lateralOffset;
      var py = cy0 - DIR_FLOW_Y * distAlongPath + normY * lateralOffset;

      var speed = 2.4 + Math.random() * 2.2;
      return {
        x: px,
        y: py,
        speed: speed,
        vx: DIR_FLOW_X * speed,
        vy: DIR_FLOW_Y * speed,
        lateralOffset: lateralOffset,
        trail: [],
        maxTrail: 8 + Math.floor(Math.random() * 8)
      };
    }

    function createExhaustParticle() {
      return {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.45,
        size: 1.5 + Math.random() * 3,
        active: false
      };
    }

    function createSparkParticle() {
      return {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.35,
        size: 1 + Math.random() * 1.5,
        active: false
      };
    }

    // ---- Compact 3D Rocket Geometry (Scaled down ~25% for safety margin) ----
    var NOSE_TIP_X = 66;
    var NOSE_BASE_X = 22;
    var BODY_RADIUS = 12.5;
    var BODY_AFT_X = -38;
    var BOATTAIL_AFT_X = -52;
    var NOZZLE_THROAT_X = -52;
    var NOZZLE_EXIT_X = -66;
    var NOZZLE_THROAT_R = 7.5;
    var NOZZLE_EXIT_R = 11.5;

    var FIN_X_ROOT_FRONT = -18;
    var FIN_X_ROOT_BACK = -48;
    var FIN_X_TIP_FRONT = -26;
    var FIN_X_TIP_BACK = -44;
    var FIN_SPAN = 18.5;

    var rocketStations = [];
    (function () {
      var noseSlices = 10;
      for (var i = 0; i <= noseSlices; i++) {
        var t = i / noseSlices;
        var x = NOSE_BASE_X + (NOSE_TIP_X - NOSE_BASE_X) * t;
        var r = BODY_RADIUS * Math.sqrt(Math.max(0, 1 - Math.pow(t, 1.8)));
        rocketStations.push({ x: x, r: r, type: 'nose' });
      }
      rocketStations.push({ x: 8, r: BODY_RADIUS, type: 'body' });
      rocketStations.push({ x: -10, r: BODY_RADIUS, type: 'body' });
      rocketStations.push({ x: -24, r: BODY_RADIUS, type: 'body' });
      rocketStations.push({ x: BODY_AFT_X, r: BODY_RADIUS, type: 'body' });
      rocketStations.push({ x: BOATTAIL_AFT_X, r: 10.0, type: 'boattail' });
      rocketStations.push({ x: NOZZLE_THROAT_X, r: NOZZLE_THROAT_R, type: 'nozzle-throat' });
      rocketStations.push({ x: NOZZLE_EXIT_X, r: NOZZLE_EXIT_R, type: 'nozzle-exit' });
      rocketStations.sort(function (a, b) { return b.x - a.x; });
    })();

    // 3D rotation transform: Pitch (around Z), Yaw (around Y), Roll (around X)
    function transform3D(x, y, z, pitch, yaw, roll) {
      // Roll around X
      var cr = Math.cos(roll), sr = Math.sin(roll);
      var y1 = y * cr - z * sr;
      var z1 = y * sr + z * cr;

      // Pitch around Z (negative pitch tilts nose UP in canvas)
      var cp = Math.cos(pitch), sp = Math.sin(pitch);
      var x2 = x * cp - y1 * sp;
      var y2 = x * sp + y1 * cp;

      // Yaw around Y
      var cy = Math.cos(yaw), sy = Math.sin(yaw);
      var x3 = x2 * cy + z1 * sy;
      var z3 = -x2 * sy + z1 * cy;

      return { x: x3, y: y2, z: z3 };
    }

    var FOV = 440;
    function project3D(p3, cx, cy, scale) {
      var s = FOV / (FOV + p3.z + 70);
      return {
        x: cx + p3.x * s * scale,
        y: cy - p3.y * s * scale,
        z: p3.z,
        s: s * scale
      };
    }

    function getPhaseInfo(elapsed) {
      var tMod = elapsed % CYCLE;
      var phase = 0;
      for (var i = PHASES.length - 1; i >= 0; i--) {
        if (tMod >= PHASE_STARTS[i]) {
          phase = i;
          break;
        }
      }
      var phaseT = (tMod - PHASE_STARTS[phase]) / PHASES[phase];
      return { phase: phase, t: phaseT, tMod: tMod };
    }

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    function easeOut(t) {
      return 1 - (1 - t) * (1 - t);
    }

    // ---- 1. Subtle Engineering Grid (No Text, Purely Graphical) ----
    function drawEngineeringGrid(cx, cy, scale, alpha, pitch, yaw) {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = alpha * 0.45;

      var step = 24 * scale;
      var gridSpan = 4 * step;
      var floorY = -36;

      ctx.lineWidth = 0.5 * dpr;
      ctx.strokeStyle = 'rgba(31, 78, 121, 0.12)';

      for (var zi = -3; zi <= 3; zi++) {
        var zPos = zi * (gridSpan / 3);
        var pStart = project3D(transform3D(-90, floorY, zPos, pitch, yaw, 0), cx, cy, scale);
        var pEnd = project3D(transform3D(90, floorY, zPos, pitch, yaw, 0), cx, cy, scale);
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();
      }

      for (var xi = -4; xi <= 4; xi++) {
        var xPos = xi * (gridSpan / 4);
        var p1 = project3D(transform3D(xPos, floorY, -gridSpan, pitch, yaw, 0), cx, cy, scale);
        var p2 = project3D(transform3D(xPos, floorY, gridSpan, pitch, yaw, 0), cx, cy, scale);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Minimal coordinate axes triad (pure lines, zero text labels)
      var originP = project3D(transform3D(-80, floorY, -25, pitch, yaw, 0), cx, cy, scale);
      var xAxisP = project3D(transform3D(-55, floorY, -25, pitch, yaw, 0), cx, cy, scale);
      var yAxisP = project3D(transform3D(-80, floorY + 22, -25, pitch, yaw, 0), cx, cy, scale);
      var zAxisP = project3D(transform3D(-80, floorY, 0, pitch, yaw, 0), cx, cy, scale);

      ctx.lineWidth = 1.0 * dpr;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath(); ctx.moveTo(originP.x, originP.y); ctx.lineTo(xAxisP.x, xAxisP.y); ctx.stroke();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.beginPath(); ctx.moveTo(originP.x, originP.y); ctx.lineTo(yAxisP.x, yAxisP.y); ctx.stroke();
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
      ctx.beginPath(); ctx.moveTo(originP.x, originP.y); ctx.lineTo(zAxisP.x, zAxisP.y); ctx.stroke();

      ctx.restore();
    }

    // ---- 2. Supersonic Bow Shock & Mach Cone (Contained & Scaled) ----
    function drawBowShock(cx, cy, scale, shockAlpha, pitch, yaw, roll) {
      if (shockAlpha <= 0.01) return;
      ctx.save();

      var apex3D = transform3D(NOSE_TIP_X + 8, 0, 0, pitch, yaw, roll);
      var apexP = project3D(apex3D, cx, cy, scale);

      var kFactor = 0.055;
      var shockSpans = [115, 95, 68];
      var shockColors = [
        'rgba(37, 99, 235, ' + (shockAlpha * 0.12) + ')',
        'rgba(6, 182, 212, ' + (shockAlpha * 0.35) + ')',
        'rgba(245, 158, 11, ' + (shockAlpha * 0.45) + ')'
      ];

      for (var s = 0; s < shockSpans.length; s++) {
        var maxSpan = shockSpans[s];
        var ptsTop = [];
        var ptsBot = [];
        var numPts = 18;

        for (var i = 0; i <= numPts; i++) {
          var spanR = (i / numPts) * maxSpan;
          var xDist = Math.pow(spanR / 8, 1.55) * kFactor * 20;
          var xPos = (NOSE_TIP_X + 8) - xDist;

          var pTop3 = transform3D(xPos, spanR * 0.9, spanR * 0.25, pitch, yaw, roll);
          var pBot3 = transform3D(xPos, -spanR * 0.9, -spanR * 0.25, pitch, yaw, roll);

          ptsTop.push(project3D(pTop3, cx, cy, scale));
          ptsBot.push(project3D(pBot3, cx, cy, scale));
        }

        ctx.beginPath();
        ctx.moveTo(ptsTop[ptsTop.length - 1].x, ptsTop[ptsTop.length - 1].y);
        for (var j = ptsTop.length - 2; j >= 0; j--) {
          ctx.lineTo(ptsTop[j].x, ptsTop[j].y);
        }
        ctx.lineTo(apexP.x, apexP.y);
        for (var k = 0; k < ptsBot.length; k++) {
          ctx.lineTo(ptsBot[k].x, ptsBot[k].y);
        }

        ctx.strokeStyle = shockColors[s];
        ctx.lineWidth = (s === 1 ? 1.4 : 0.9) * dpr;
        ctx.stroke();

        if (s === 2) {
          ctx.fillStyle = 'rgba(245, 158, 11, ' + (shockAlpha * 0.08) + ')';
          ctx.fill();
        }
      }

      // Detached Stagnation Point compression bulb
      var bulbRadius = 15 * dpr * (scale / 1.2);
      var stagGrad = ctx.createRadialGradient(apexP.x, apexP.y, 1 * dpr, apexP.x, apexP.y, bulbRadius);
      stagGrad.addColorStop(0, 'rgba(254, 240, 138, ' + (shockAlpha * 0.7) + ')');
      stagGrad.addColorStop(0.35, 'rgba(245, 158, 11, ' + (shockAlpha * 0.4) + ')');
      stagGrad.addColorStop(0.7, 'rgba(6, 182, 212, ' + (shockAlpha * 0.15) + ')');
      stagGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
      ctx.fillStyle = stagGrad;
      ctx.beginPath();
      ctx.arc(apexP.x, apexP.y, bulbRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // ---- 3. Aerodynamic Streamlines Along Diagonal Flow ----
    function updateAndDrawStreamlines(cx, cy, scale, flowAlpha, pitch, yaw, roll) {
      if (flowAlpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = flowAlpha;

      var nose3D = transform3D(NOSE_TIP_X, 0, 0, pitch, yaw, roll);
      var noseP = project3D(nose3D, cx, cy, scale);
      var aft3D = transform3D(NOZZLE_EXIT_X, 0, 0, pitch, yaw, roll);
      var aftP = project3D(aft3D, cx, cy, scale);

      var bodyRadiusPx = BODY_RADIUS * scale * 1.8;

      for (var i = 0; i < flowParticles.length; i++) {
        var p = flowParticles[i];

        p.x += p.vx * dpr;
        p.y += p.vy * dpr;

        // Vector from rocket center to particle
        var dxC = p.x - (noseP.x + aftP.x) * 0.5;
        var dyC = p.y - (noseP.y + aftP.y) * 0.5;

        // Project particle onto lateral axis perpendicular to flow
        var lateralDist = dxC * (-DIR_FLOW_Y) + dyC * (DIR_FLOW_X);

        // Check if particle is near fuselage length
        var distToNose = (p.x - noseP.x) * DIR_FLOW_X + (p.y - noseP.y) * DIR_FLOW_Y;
        var distToAft = (p.x - aftP.x) * DIR_FLOW_X + (p.y - aftP.y) * DIR_FLOW_Y;

        if (distToNose > -30 * scale && distToAft < 25 * scale) {
          if (Math.abs(lateralDist) < bodyRadiusPx * 1.8) {
            var push = (1 - Math.abs(lateralDist) / (bodyRadiusPx * 1.8)) * 1.6 * dpr;
            var pushSign = lateralDist >= 0 ? 1 : -1;
            p.x += (-DIR_FLOW_Y) * pushSign * push;
            p.y += (DIR_FLOW_X) * pushSign * push;
          }
        }

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.maxTrail) {
          p.trail.shift();
        }

        // Recycle when off-screen
        if (p.x < -30 || p.y > H + 30 || p.x > W + 60 || p.y < -40) {
          flowParticles[i] = createFlowParticle(false);
          continue;
        }

        // Draw streamline
        if (p.trail.length >= 2) {
          var isNearVehicle = Math.abs(lateralDist) < bodyRadiusPx * 2.2 && distToNose > -20 * scale && distToAft < 20 * scale;
          var strokeCol = isNearVehicle
            ? 'rgba(6, 182, 212, ' + (0.85 * flowAlpha) + ')'
            : 'rgba(37, 99, 235, ' + (0.4 * flowAlpha) + ')';

          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (var t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = (isNearVehicle ? 1.3 : 0.8) * dpr;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Particle head
          var head = p.trail[p.trail.length - 1];
          ctx.beginPath();
          ctx.arc(head.x, head.y, (isNearVehicle ? 1.8 : 1.1) * dpr, 0, Math.PI * 2);
          ctx.fillStyle = isNearVehicle ? '#E0F2FE' : '#38BDF8';
          ctx.fill();
        }
      }

      ctx.restore();
    }

    // ---- 4. 3D Rocket Body, Fins, and Structural Detailing ----
    function drawRocket3D(cx, cy, scale, revealPct, bodyAlpha, pitch, yaw, roll) {
      if (bodyAlpha <= 0.01 || revealPct <= 0) return;
      ctx.save();

      var numAngularSegs = 20;
      var lightDir = { x: 0.35, y: 0.8, z: 0.48 };
      var lLen = Math.sqrt(lightDir.x * lightDir.x + lightDir.y * lightDir.y + lightDir.z * lightDir.z);
      lightDir.x /= lLen; lightDir.y /= lLen; lightDir.z /= lLen;

      var totalLen = NOSE_TIP_X - NOZZLE_EXIT_X;
      var currentRevealX = NOZZLE_EXIT_X + totalLen * revealPct;

      var polygons = [];

      // Fuselage & Nozzle surface facets
      for (var si = 0; si < rocketStations.length - 1; si++) {
        var stA = rocketStations[si];
        var stB = rocketStations[si + 1];

        if (stB.x > currentRevealX) continue;

        for (var a = 0; a < numAngularSegs; a++) {
          var th1 = (a / numAngularSegs) * Math.PI * 2;
          var th2 = ((a + 1) / numAngularSegs) * Math.PI * 2;

          var yA1 = stA.r * Math.cos(th1), zA1 = stA.r * Math.sin(th1);
          var yA2 = stA.r * Math.cos(th2), zA2 = stA.r * Math.sin(th2);
          var yB1 = stB.r * Math.cos(th1), zB1 = stB.r * Math.sin(th1);
          var yB2 = stB.r * Math.cos(th2), zB2 = stB.r * Math.sin(th2);

          var p1_3d = transform3D(stA.x, yA1, zA1, pitch, yaw, roll);
          var p2_3d = transform3D(stA.x, yA2, zA2, pitch, yaw, roll);
          var p3_3d = transform3D(stB.x, yB2, zB2, pitch, yaw, roll);
          var p4_3d = transform3D(stB.x, yB1, zB1, pitch, yaw, roll);

          var avgZ = (p1_3d.z + p2_3d.z + p3_3d.z + p4_3d.z) / 4;

          var midTheta = (th1 + th2) * 0.5;
          var normLocal = {
            x: (stB.r - stA.r) / Math.max(1, (stA.x - stB.x)),
            y: Math.cos(midTheta),
            z: Math.sin(midTheta)
          };
          var normLen = Math.sqrt(normLocal.x * normLocal.x + normLocal.y * normLocal.y + normLocal.z * normLocal.z);
          normLocal.x /= normLen; normLocal.y /= normLen; normLocal.z /= normLen;

          var norm3d = transform3D(normLocal.x, normLocal.y, normLocal.z, pitch, yaw, roll);
          var facingCam = norm3d.z;
          var isNozzle = (stB.type === 'nozzle-exit' || stB.type === 'nozzle-throat');

          if (facingCam < -0.15 && !isNozzle) continue;

          var diff = Math.max(0.12, norm3d.x * lightDir.x + norm3d.y * lightDir.y + norm3d.z * lightDir.z);
          var spec = Math.pow(Math.max(0, norm3d.y * 0.8 + norm3d.z * 0.6), 10) * 0.55;

          polygons.push({
            type: 'fuselage',
            sectionType: stA.type,
            pts: [
              project3D(p1_3d, cx, cy, scale),
              project3D(p2_3d, cx, cy, scale),
              project3D(p3_3d, cx, cy, scale),
              project3D(p4_3d, cx, cy, scale)
            ],
            avgZ: avgZ,
            diff: diff,
            spec: spec
          });
        }
      }

      // 4 Aerodynamic Control Fins
      var finAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
      for (var f = 0; f < finAngles.length; f++) {
        var baseAngle = finAngles[f];
        var cosF = Math.cos(baseAngle), sinF = Math.sin(baseAngle);

        var rootFront = { x: FIN_X_ROOT_FRONT, y: BODY_RADIUS * cosF, z: BODY_RADIUS * sinF };
        var rootBack = { x: FIN_X_ROOT_BACK, y: BODY_RADIUS * cosF, z: BODY_RADIUS * sinF };
        var tipBack = { x: FIN_X_TIP_BACK, y: (BODY_RADIUS + FIN_SPAN) * cosF, z: (BODY_RADIUS + FIN_SPAN) * sinF };
        var tipFront = { x: FIN_X_TIP_FRONT, y: (BODY_RADIUS + FIN_SPAN) * cosF, z: (BODY_RADIUS + FIN_SPAN) * sinF };

        if (rootBack.x > currentRevealX) continue;

        var f1 = transform3D(rootFront.x, rootFront.y, rootFront.z, pitch, yaw, roll);
        var f2 = transform3D(tipFront.x, tipFront.y, tipFront.z, pitch, yaw, roll);
        var f3 = transform3D(tipBack.x, tipBack.y, tipBack.z, pitch, yaw, roll);
        var f4 = transform3D(rootBack.x, rootBack.y, rootBack.z, pitch, yaw, roll);

        var finAvgZ = (f1.z + f2.z + f3.z + f4.z) / 4;
        var normFinLocal = { x: 0, y: -sinF, z: cosF };
        var normFin3D = transform3D(normFinLocal.x, normFinLocal.y, normFinLocal.z, pitch, yaw, roll);
        var finDiff = Math.max(0.25, Math.abs(normFin3D.x * lightDir.x + normFin3D.y * lightDir.y + normFin3D.z * lightDir.z));

        polygons.push({
          type: 'fin',
          pts: [
            project3D(f1, cx, cy, scale),
            project3D(f2, cx, cy, scale),
            project3D(f3, cx, cy, scale),
            project3D(f4, cx, cy, scale)
          ],
          avgZ: finAvgZ,
          diff: finDiff
        });
      }

      // Painter's sorting (back to front)
      polygons.sort(function (a, b) { return a.avgZ - b.avgZ; });

      // Draw all polygons
      for (var p = 0; p < polygons.length; p++) {
        var poly = polygons[p];
        var pts = poly.pts;

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (var pi = 1; pi < pts.length; pi++) {
          ctx.lineTo(pts[pi].x, pts[pi].y);
        }
        ctx.closePath();

        if (poly.type === 'fin') {
          var rFin = Math.round(30 + poly.diff * 35);
          var gFin = Math.round(90 + poly.diff * 60);
          var bFin = Math.round(200 + poly.diff * 55);
          ctx.fillStyle = 'rgba(' + rFin + ',' + gFin + ',' + bFin + ',' + (bodyAlpha * 0.95) + ')';
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, ' + (bodyAlpha * 0.4) + ')';
          ctx.lineWidth = 0.8 * dpr;
          ctx.stroke();
        } else {
          var rBase, gBase, bBase;

          if (poly.sectionType === 'nose') {
            rBase = Math.round(25 + poly.diff * 35 + poly.spec * 70);
            gBase = Math.round(40 + poly.diff * 50 + poly.spec * 80);
            bBase = Math.round(65 + poly.diff * 65 + poly.spec * 100);
          } else if (poly.sectionType === 'nozzle-exit' || poly.sectionType === 'nozzle-throat') {
            rBase = Math.round(75 + poly.diff * 60);
            gBase = Math.round(65 + poly.diff * 50);
            bBase = Math.round(55 + poly.diff * 40);
          } else {
            rBase = Math.round(180 + poly.diff * 60 + poly.spec * 15);
            gBase = Math.round(195 + poly.diff * 55 + poly.spec * 15);
            bBase = Math.round(215 + poly.diff * 40 + poly.spec * 15);
          }

          ctx.fillStyle = 'rgba(' + rBase + ',' + gBase + ',' + bBase + ',' + (bodyAlpha * 0.92) + ')';
          ctx.fill();

          ctx.strokeStyle = 'rgba(31, 78, 121, ' + (bodyAlpha * 0.08) + ')';
          ctx.lineWidth = 0.4 * dpr;
          ctx.stroke();
        }
      }

      // Circumferential panel rings
      if (revealPct > 0.4) {
        var seamPositions = [22, 0, -20, -38];
        ctx.strokeStyle = 'rgba(37, 99, 235, ' + (bodyAlpha * 0.25) + ')';
        ctx.lineWidth = 0.8 * dpr;

        for (var sm = 0; sm < seamPositions.length; sm++) {
          var sX = seamPositions[sm];
          if (sX > currentRevealX) continue;

          ctx.beginPath();
          var first = true;
          for (var a2 = 0; a2 <= numAngularSegs; a2++) {
            var th = (a2 / numAngularSegs) * Math.PI * 2;
            var yS = BODY_RADIUS * 1.01 * Math.cos(th);
            var zS = BODY_RADIUS * 1.01 * Math.sin(th);
            var pRing3 = transform3D(sX, yS, zS, pitch, yaw, roll);

            if (pRing3.z >= -BODY_RADIUS * 0.4) {
              var pr = project3D(pRing3, cx, cy, scale);
              if (first) {
                ctx.moveTo(pr.x, pr.y);
                first = false;
              } else {
                ctx.lineTo(pr.x, pr.y);
              }
            } else {
              first = true;
            }
          }
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // ---- 5. Proportional, Safe-Bounded Engine Plume & Shock Diamonds ----
    function updateAndDrawEngineExhaust(cx, cy, scale, exhaustAlpha, pitch, yaw, roll) {
      if (exhaustAlpha <= 0.01) return;
      ctx.save();

      var nozzleExit3D = transform3D(NOZZLE_EXIT_X, 0, 0, pitch, yaw, roll);
      var nozzleP = project3D(nozzleExit3D, cx, cy, scale);

      // Vector pointing back into exhaust stream
      var plumeEnd3D = transform3D(NOZZLE_EXIT_X - 85, 0, 0, pitch, yaw, roll);
      var plumeEndP = project3D(plumeEnd3D, cx, cy, scale);

      var dxAxis = plumeEndP.x - nozzleP.x;
      var dyAxis = plumeEndP.y - nozzleP.y;
      var plumeLen = Math.sqrt(dxAxis * dxAxis + dyAxis * dyAxis);
      var ux = dxAxis / Math.max(1, plumeLen);
      var uy = dyAxis / Math.max(1, plumeLen);
      var perpX = -uy;
      var perpY = ux;

      var flameWidth = NOZZLE_EXIT_R * 1.4 * scale;
      var flameLength = 75 * scale;

      // Exhaust flame envelope
      var flameGrad = ctx.createLinearGradient(nozzleP.x, nozzleP.y, nozzleP.x + ux * flameLength, nozzleP.y + uy * flameLength);
      flameGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (exhaustAlpha * 1.0) + ')');
      flameGrad.addColorStop(0.15, 'rgba(14, 165, 233, ' + (exhaustAlpha * 0.95) + ')');
      flameGrad.addColorStop(0.35, 'rgba(6, 182, 212, ' + (exhaustAlpha * 0.9) + ')');
      flameGrad.addColorStop(0.65, 'rgba(245, 158, 11, ' + (exhaustAlpha * 0.85) + ')');
      flameGrad.addColorStop(0.85, 'rgba(239, 68, 68, ' + (exhaustAlpha * 0.6) + ')');
      flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.beginPath();
      ctx.moveTo(nozzleP.x + perpX * flameWidth * 0.5, nozzleP.y + perpY * flameWidth * 0.5);
      ctx.quadraticCurveTo(
        nozzleP.x + ux * flameLength * 0.4 + perpX * flameWidth * 0.75,
        nozzleP.y + uy * flameLength * 0.4 + perpY * flameWidth * 0.75,
        nozzleP.x + ux * flameLength,
        nozzleP.y + uy * flameLength
      );
      ctx.quadraticCurveTo(
        nozzleP.x + ux * flameLength * 0.4 - perpX * flameWidth * 0.75,
        nozzleP.y + uy * flameLength * 0.4 - perpY * flameWidth * 0.75,
        nozzleP.x - perpX * flameWidth * 0.5,
        nozzleP.y - perpY * flameWidth * 0.5
      );
      ctx.closePath();
      ctx.fillStyle = flameGrad;
      ctx.fill();

      // Supersonic Shock Diamonds (Mach disks)
      var numDiamonds = 3;
      var diamondSpacing = 14 * scale;

      for (var d = 1; d <= numDiamonds; d++) {
        var dDist = d * diamondSpacing;
        var dCx = nozzleP.x + ux * dDist;
        var dCy = nozzleP.y + uy * dDist;
        var dW = (diamondSpacing * 0.4) * (1 - d * 0.15);
        var dH = (flameWidth * 0.3) * (1 - d * 0.18);

        ctx.beginPath();
        ctx.moveTo(dCx - ux * dW, dCy - uy * dW);
        ctx.lineTo(dCx + perpX * dH, dCy + perpY * dH);
        ctx.lineTo(dCx + ux * dW, dCy + uy * dW);
        ctx.lineTo(dCx - perpX * dH, dCy - perpY * dH);
        ctx.closePath();

        ctx.fillStyle = 'rgba(255, 255, 255, ' + (exhaustAlpha * (0.9 - d * 0.15)) + ')';
        ctx.fill();

        ctx.strokeStyle = 'rgba(56, 189, 248, ' + (exhaustAlpha * 0.7) + ')';
        ctx.lineWidth = 0.7 * dpr;
        ctx.stroke();
      }

      // Exhaust Particles (trailing safely within canvas)
      for (var ep = 0; ep < exhaustParticles.length; ep++) {
        var p = exhaustParticles[ep];

        if (!p.active || p.life <= 0) {
          var spread = (Math.random() - 0.5) * flameWidth * 0.5;
          p.x = nozzleP.x + perpX * spread;
          p.y = nozzleP.y + perpY * spread;
          var speed = (2.8 + Math.random() * 4.2) * dpr;
          p.vx = ux * speed + (Math.random() - 0.5) * 1.2 * dpr;
          p.vy = uy * speed + (Math.random() - 0.5) * 1.2 * dpr;
          p.life = p.maxLife;
          p.size = (1.5 + Math.random() * 2.8) * dpr;
          p.active = true;
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.size *= 1.02;
        p.life -= 0.025;

        var lifeRatio = p.life / p.maxLife;
        var partAlpha = lifeRatio * exhaustAlpha * 0.6;

        var rCol, gCol, bCol;
        if (lifeRatio > 0.65) {
          rCol = 224; gCol = 242; bCol = 254;
        } else if (lifeRatio > 0.3) {
          rCol = 245; gCol = 158; bCol = 11;
        } else {
          rCol = 239; gCol = 68; bCol = 68;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rCol + ',' + gCol + ',' + bCol + ',' + partAlpha + ')';
        ctx.fill();
      }

      // Sparks
      for (var sp = 0; sp < sparkParticles.length; sp++) {
        var spark = sparkParticles[sp];
        if (!spark.active || spark.life <= 0) {
          spark.x = nozzleP.x;
          spark.y = nozzleP.y;
          var spSpeed = (4 + Math.random() * 5.5) * dpr;
          var spAngle = (Math.random() - 0.5) * 0.45;
          spark.vx = (ux * Math.cos(spAngle) + perpX * Math.sin(spAngle)) * spSpeed;
          spark.vy = (uy * Math.cos(spAngle) + perpY * Math.sin(spAngle)) * spSpeed;
          spark.life = spark.maxLife;
          spark.size = (1.0 + Math.random() * 1.2) * dpr;
          spark.active = true;
          continue;
        }

        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.life -= 0.04;

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(254, 240, 138, ' + (spark.life * exhaustAlpha) + ')';
        ctx.fill();
      }

      ctx.restore();
    }

    // ---- Main Animation Loop ----
    function frame(now) {
      if (!running) return;
      var elapsed = now - startTime;
      var info = getPhaseInfo(elapsed);

      ctx.clearRect(0, 0, W, H);

      // Centered with comfortable safe margin on all sides
      var centerX = W * 0.50;
      var centerY = H * 0.48;

      // Scale reduced by ~25% from original (fits inside container with zero clipping)
      var scale = Math.min(W / 520, H / 440) * 1.12;

      // Base 3D orientation:
      // - Pitch: 0.48 rad (~ +27.5 deg) -> points nose UPWARD toward UPPER-RIGHT
      // - Yaw: 0.35 rad (~ 20 deg) -> classic 3/4 engineering perspective
      // - Roll: 0.22 rad (~ 12.5 deg) -> elegant fin presentation
      var basePitch = 0.48;
      var baseYaw = 0.35;
      var baseRoll = 0.22;

      var revealPct = 1.0;
      var gridAlpha = 0.0;
      var shockAlpha = 0.0;
      var flowAlpha = 0.0;
      var bodyAlpha = 1.0;
      var exhaustAlpha = 0.0;

      var currentPitch = basePitch;
      var currentYaw = baseYaw;
      var currentRoll = baseRoll;

      // Phase 0: Technical Reveal (Grid & Wireframe scan)
      if (info.phase === 0) {
        var t0 = easeInOut(info.t);
        gridAlpha = t0 * 0.6;
        revealPct = t0;
        bodyAlpha = t0;
      }
      // Phase 1: 3D Controlled Inspection (Gentle rotational movement)
      else if (info.phase === 1) {
        gridAlpha = 0.45;
        revealPct = 1.0;
        bodyAlpha = 1.0;
        currentYaw = baseYaw + Math.sin(info.t * Math.PI) * 0.4;
        currentRoll = baseRoll + Math.sin(info.t * Math.PI) * 0.25;
        currentPitch = basePitch + Math.sin(info.t * Math.PI * 2) * 0.04;
        shockAlpha = 0.15 * info.t;
        flowAlpha = 0.25 * info.t;
      }
      // Phase 2: CFD Flow Activation & Supersonic Bow Shock
      else if (info.phase === 2) {
        var t2 = easeOut(info.t);
        gridAlpha = 0.35;
        revealPct = 1.0;
        bodyAlpha = 1.0;
        shockAlpha = t2;
        flowAlpha = t2;
        exhaustAlpha = 0.12 * t2;
      }
      // Phase 3: Engine Plume Ignition & Shock Diamonds
      else if (info.phase === 3) {
        var igT = easeOut(Math.min(1, info.t * 2.2));
        gridAlpha = 0.25;
        revealPct = 1.0;
        bodyAlpha = 1.0;
        shockAlpha = 1.0;
        flowAlpha = 1.0;
        exhaustAlpha = igT;
        // Subtle thrust jitter
        currentPitch = basePitch + (Math.random() - 0.5) * 0.006;
        currentYaw = baseYaw + (Math.random() - 0.5) * 0.006;
      }
      // Phase 4: Seamless Loop Transition
      else if (info.phase === 4) {
        var t4 = easeInOut(info.t);
        gridAlpha = 0.25 * (1 - t4);
        revealPct = 1.0 - t4 * 0.35;
        bodyAlpha = 1.0 - t4 * 0.5;
        shockAlpha = 1.0 - t4;
        flowAlpha = 0.7 * (1 - t4);
        exhaustAlpha = 0.7 * (1 - t4);
      }

      // Draw all elements in depth order (NO TEXT, PURELY GRAPHICAL)
      drawEngineeringGrid(centerX, centerY, scale, gridAlpha, currentPitch, currentYaw);
      drawBowShock(centerX, centerY, scale, shockAlpha, currentPitch, currentYaw, currentRoll);
      updateAndDrawStreamlines(centerX, centerY, scale, flowAlpha, currentPitch, currentYaw, currentRoll);
      drawRocket3D(centerX, centerY, scale, revealPct, bodyAlpha, currentPitch, currentYaw, currentRoll);
      updateAndDrawEngineExhaust(centerX, centerY, scale, exhaustAlpha, currentPitch, currentYaw, currentRoll);

      requestAnimationFrame(frame);
    }

    // Static fallback for reduced motion
    function drawStatic() {
      resize();
      ctx.clearRect(0, 0, W, H);
      var centerX = W * 0.50;
      var centerY = H * 0.48;
      var scale = Math.min(W / 520, H / 440) * 1.12;
      drawEngineeringGrid(centerX, centerY, scale, 0.4, 0.48, 0.35);
      drawBowShock(centerX, centerY, scale, 0.7, 0.48, 0.35, 0.22);
      drawRocket3D(centerX, centerY, scale, 1.0, 0.95, 0.48, 0.35, 0.22);
    }

    if (reducedMotion) {
      drawStatic();
      return { destroy: function () {} };
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(frame);

    return {
      pause: function () { running = false; },
      resume: function () {
        if (!running) {
          running = true;
          startTime = performance.now() - (startTime > 0 ? 0 : 0);
          requestAnimationFrame(frame);
        }
      },
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
