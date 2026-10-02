const cfg = window.SUPABASE_CONFIG;
const { createClient } = window.supabase;
const client = cfg?.url && !cfg.url.includes("PASTE_YOUR") ? createClient(cfg.url, cfg.anonKey) : null;
const params = new URLSearchParams(location.search);
const slug = params.get("slug");
const category = params.get("category") || document.body.dataset.category || "";
const root = document.getElementById("projectRoot");

function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
function url(f) { if (!f || f.bucket !== "portfolio-public" || !cfg?.url) return ""; return `${cfg.url}/storage/v1/object/public/${f.bucket}/${f.storage_path}`; }
function files(item) { return Array.isArray(item.content_files) ? [...item.content_files].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)) : []; }
function isImage(f) { return /^image\//i.test(f?.mime || "") || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(f?.original_name || ""); }
function isVideo(f) { return /^video\//i.test(f?.mime || "") || /\.(mp4|webm|mov|avi|m4v)$/i.test(f?.original_name || ""); }
function isModel(f) { return /\.(glb|gltf)$/i.test(f?.original_name || "") || f?.mime === "model/gltf-binary" || f?.mime === "model/gltf+json"; }
function isPdf(f) { return f?.mime === "application/pdf" || /\.pdf$/i.test(f?.original_name || ""); }
function role(f) { return f?.file_role || "attachment"; }
function filesByRole(fs, roles) { return fs.filter(f => roles.includes(role(f))); }
function unique(list) { return list.filter((f,i,a)=>a.findIndex(x=>x.id===f.id)===i); }
function openFile(f,label="OPEN") { return `<a class="file-chip" href="${esc(url(f))}" target="_blank" rel="noopener"><span>${esc(f.original_name)}</span><b>${label} ↗</b></a>`; }
function imageCards(list, title) { if(!list.length)return ""; return `<section class="project-section"><div class="project-section-head"><span>PROJECT VISUALS</span><h2>${esc(title)}</h2></div><div class="project-gallery">${list.map(f=>`<a href="${esc(url(f))}" target="_blank" rel="noopener"><img src="${esc(url(f))}" alt="${esc(f.original_name)}" loading="lazy"></a>`).join("")}</div></section>`; }
function videoCards(list) { if(!list.length)return ""; return `<section class="project-section"><div class="project-section-head"><span>SIMULATION / ANIMATION</span><h2>Motion<br><em>results.</em></h2></div><div class="project-videos">${list.map(f=>`<video controls preload="metadata"><source src="${esc(url(f))}" type="${esc(f.mime || "video/mp4")}"></video>`).join("")}</div></section>`; }
function fileSection(list,title,label="OPEN") { if(!list.length)return ""; return `<section class="project-section"><div class="project-section-head"><span>DOWNLOADABLE FILES</span><h2>${esc(title)}</h2></div><div class="file-list">${list.map(f=>openFile(f,label)).join("")}</div></section>`; }
function textSection(label,title,text){ if(!text)return ""; return `<section class="project-section project-text-section"><div class="project-section-head"><span>${esc(label)}</span><h2>${esc(title)}</h2></div><div class="project-prose">${esc(text).split(/\n\s*\n/).map(p=>`<p>${p.replace(/\n/g,"<br>")}</p>`).join("")}</div></section>`; }

function render(item) {
  const fs = files(item);
  const images = fs.filter(isImage);
  const thumb = fs.find(f => role(f)==="thumbnail") || images[0];
  const drawings = filesByRole(fs,["drawing_2d"]);
  const models = filesByRole(fs,["model_3d"]);
  const cadSources = filesByRole(fs,["cad_source"]);
  const projectImages = filesByRole(fs,["project_image"]);
  const simulationResults = filesByRole(fs,["simulation_result"]);
  const simulationVideos = filesByRole(fs,["simulation_animation"]);
  const reports = filesByRole(fs,["report"]);
  const codeData = filesByRole(fs,["code_dataset"]);
  const attachments = fs.filter(f => !["thumbnail","drawing_2d","model_3d","cad_source","project_image","simulation_result","simulation_animation","report","code_dataset"].includes(role(f)));
  const model = models[0];
  const modelUrl = url(model);
  const allResultImages = unique(simulationResults.filter(isImage));
  const resultPdfs = simulationResults.filter(isPdf);
  const back = category ? `./${encodeURIComponent(category === "robotics-projects" ? "robotics-projects" : category)}.html` : "index.html";
  const projectImagesWithFallback = projectImages.length ? projectImages.filter(isImage) : (thumb ? [] : images);

  document.title = `${item.title} — Tanbir Hasan`;
  root.innerHTML = `
    <section class="project-hero">
      <a class="back-link" href="${back}">← BACK TO ARCHIVE</a>
      <div class="project-meta">${esc((item.category || category).toUpperCase())} · ${esc(item.project_kind || "ENGINEERING PROJECT")} · ${esc(item.technologies?.join(" · ") || "")}</div>
      <h1>${esc(item.title)}</h1>
      ${item.description ? `<p class="project-lead">${esc(item.description)}</p>` : ""}
      ${item.date || item.external_url ? `<div class="project-actions">${item.date ? `<span class="project-date">${esc(new Date(item.date+"T00:00:00").toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"}))}</span>` : ""}${item.external_url ? `<a class="btn primary" href="${esc(item.external_url)}" target="_blank" rel="noopener">OPEN EXTERNAL LINK ↗</a>` : ""}</div>` : ""}
    </section>

    ${textSection("01 / PROJECT OVERVIEW","Overview",item.project_overview)}
    ${textSection("02 / OBJECTIVES","Objectives",item.objectives)}
    ${textSection("03 / METHODOLOGY","Methodology",item.methodology)}

    ${modelUrl ? `<section class="project-section"><div class="project-section-head"><span>04 / 3D CAD MODEL</span><h2>Interactive<br><em>geometry.</em></h2></div><div class="model-viewer-wrap"><model-viewer src="${esc(modelUrl)}" camera-controls touch-action="pan-y" auto-rotate shadow-intensity="0.25" interaction-prompt="none" alt="${esc(item.title)}"></model-viewer></div>${models.length>1?`<div class="file-list model-files">${models.map(openFile).join("")}</div>`:""}</section>` : ""}

    ${drawings.length ? `<section class="project-section"><div class="project-section-head"><span>2D CAD</span><h2>Drawings &amp;<br><em>designs.</em></h2></div><div class="drawing-grid">${drawings.map(f=>isImage(f)?`<a href="${esc(url(f))}" target="_blank" rel="noopener"><img src="${esc(url(f))}" alt="${esc(f.original_name)}" loading="lazy"><b>${esc(f.original_name)}</b></a>`:`<a class="drawing-file" href="${esc(url(f))}" target="_blank" rel="noopener"><strong>2D</strong><span>${esc(f.original_name)}</span><b>OPEN ↗</b></a>`).join("")}</div></section>` : ""}

    ${projectImagesWithFallback.length ? imageCards(projectImagesWithFallback,"Project documentation.") : ""}
    ${allResultImages.length ? imageCards(allResultImages,"Simulation results.") : ""}
    ${resultPdfs.length ? fileSection(resultPdfs,"Simulation result PDFs") : ""}
    ${simulationVideos.length ? videoCards(simulationVideos) : ""}
    ${textSection("RESULTS / FINDINGS","Results",item.results)}
    ${cadSources.length ? fileSection(cadSources,"CAD source files") : ""}
    ${reports.length ? fileSection(reports,"Reports & presentations") : ""}
    ${codeData.length ? fileSection(codeData,"Code, notebooks & datasets") : ""}
    ${attachments.length ? fileSection(attachments,"Additional project files") : ""}
  `;
}

async function load() {
  if (!client || !slug) { root.innerHTML = `<p class="page-message">This project cannot be loaded yet.</p>`; return; }
  const { data, error } = await client.from("content").select("*, content_files(*)").eq("type","project").eq("slug",slug).eq("published",true).maybeSingle();
  if (error || !data) { root.innerHTML = `<p class="page-message">Project not found.</p>`; return; }
  render(data);
}
load();
