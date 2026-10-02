const cfg = window.SUPABASE_CONFIG;
const { createClient } = window.supabase;
const client = cfg?.url && !cfg.url.includes("PASTE_YOUR") ? createClient(cfg.url, cfg.anonKey) : null;
const params = new URLSearchParams(location.search);
const slug = params.get("slug");
const category = params.get("category") || document.body.dataset.category || "";
const root = document.getElementById("projectRoot");

function esc(v) { return String(v ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
function url(f) { if (!f || f.bucket !== "portfolio-public" || !cfg?.url) return ""; return `${cfg.url}/storage/v1/object/public/${f.bucket}/${f.storage_path}`; }
function files(item) { return Array.isArray(item.content_files) ? item.content_files : []; }
function isImage(f) { return /^image\//i.test(f?.mime || "") || /\.(png|jpe?g|webp|gif)$/i.test(f?.original_name || ""); }
function isVideo(f) { return /^video\//i.test(f?.mime || "") || /\.(mp4|webm|mov)$/i.test(f?.original_name || ""); }
function isModel(f) { return /\.(glb|gltf)$/i.test(f?.original_name || "") || f?.mime === "model/gltf-binary" || f?.mime === "model/gltf+json"; }
function role(f) { return f?.file_role || "attachment"; }

function render(item) {
  const fs = files(item);
  const images = fs.filter(isImage);
  const thumb = fs.find(f => role(f)==="thumbnail") || images[0];
  const gallery = fs.filter(f => isImage(f) && f.id !== thumb?.id);
  const models = fs.filter(isModel);
  const videos = fs.filter(isVideo);
  const attachments = fs.filter(f => !isImage(f) && !isVideo(f) && !isModel(f));
  const model = models[0];
  const modelUrl = url(model);
  const back = category ? `./${encodeURIComponent(category === "robotics-projects" ? "robotics-projects" : category)}.html` : "index.html";

  document.title = `${item.title} — Tanbir Hasan`;
  root.innerHTML = `
    <section class="project-hero">
      <a class="back-link" href="${back}">← BACK TO ARCHIVE</a>
      <div class="project-meta">${esc(category.toUpperCase())} · ${esc(item.technologies?.join(" · ") || "ENGINEERING PROJECT")}</div>
      <h1>${esc(item.title)}</h1>
      ${item.description ? `<p class="project-lead">${esc(item.description)}</p>` : ""}
      <div class="project-actions">
        ${item.external_url ? `<a class="btn primary" href="${esc(item.external_url)}" target="_blank" rel="noopener">OPEN EXTERNAL LINK ↗</a>` : ""}
      </div>
    </section>

    ${modelUrl ? `<section class="project-section"><div class="project-section-head"><span>01 / 3D MODEL</span><h2>Interactive<br><em>geometry.</em></h2></div><div class="model-viewer-wrap"><model-viewer src="${esc(modelUrl)}" camera-controls touch-action="pan-y" auto-rotate shadow-intensity="0.25" interaction-prompt="none" alt="${esc(item.title)}"></model-viewer></div></section>` : ""}

    ${images.length ? `<section class="project-section"><div class="project-section-head"><span>${modelUrl ? "02" : "01"} / PROJECT IMAGES</span><h2>Visual<br><em>documentation.</em></h2></div><div class="project-gallery">${images.map(f => `<a href="${esc(url(f))}" target="_blank" rel="noopener"><img src="${esc(url(f))}" alt="${esc(f.original_name || item.title)}" loading="lazy"></a>`).join("")}</div></section>` : ""}

    ${videos.length ? `<section class="project-section"><div class="project-section-head"><span>03 / SIMULATION & VIDEO</span><h2>Motion<br><em>results.</em></h2></div><div class="project-videos">${videos.map(f => `<video controls preload="metadata"><source src="${esc(url(f))}" type="${esc(f.mime || "video/mp4")}"></video>`).join("")}</div></section>` : ""}

    ${attachments.length ? `<section class="project-section"><div class="project-section-head"><span>04 / FILES</span><h2>Engineering<br><em>files.</em></h2></div><div class="file-list">${attachments.map(f => `<a href="${esc(url(f))}" target="_blank" rel="noopener"><span>${esc(f.original_name)}</span><b>OPEN ↗</b></a>`).join("")}</div></section>` : ""}
  `;
}

async function load() {
  if (!client || !slug) { root.innerHTML = `<p class="page-message">This project cannot be loaded yet.</p>`; return; }
  const { data, error } = await client.from("content").select("*, content_files(*)").eq("type","project").eq("slug",slug).eq("published",true).maybeSingle();
  if (error || !data) { root.innerHTML = `<p class="page-message">Project not found.</p>`; return; }
  render(data);
}
load();
