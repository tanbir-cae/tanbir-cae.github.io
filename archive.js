const cfg = window.SUPABASE_CONFIG;
const { createClient } = window.supabase;
const client = cfg?.url && !cfg.url.includes("PASTE_YOUR") ? createClient(cfg.url, cfg.anonKey) : null;
const params = new URLSearchParams(location.search);
const category = document.body.dataset.category;
const grid = document.getElementById("archiveGrid");
const message = document.getElementById("archiveMessage");

function esc(v) { return String(v ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
function publicUrl(f) {
  if (!f || f.bucket !== "portfolio-public" || !cfg?.url) return "";
  return `${cfg.url}/storage/v1/object/public/${f.bucket}/${f.storage_path}`;
}
function filesOf(item) { return Array.isArray(item.content_files) ? item.content_files : []; }
function thumbnail(item) {
  const fs = filesOf(item);
  const marked = fs.find(f => f.file_role === "thumbnail" && /^image\//i.test(f.mime || ""));
  return marked || fs.find(f => /^image\//i.test(f.mime || ""));
}
function projectHref(item) { return `project.html?category=${encodeURIComponent(category)}&slug=${encodeURIComponent(item.slug)}`; }

function card(item) {
  const thumb = thumbnail(item);
  const image = publicUrl(thumb);
  const tags = (item.technologies || []).slice(0,4).join(" · ");
  return `<a class="archive-project-card" href="${projectHref(item)}">
    <div class="archive-project-image ${image ? "has-image" : "no-image"}">
      ${image ? `<img src="${esc(image)}" alt="${esc(item.title)}" loading="lazy">` : `<div class="archive-project-fallback"><span>${esc((item.category || category).toUpperCase())}</span><strong>${esc(item.title)}</strong></div>`}
      <span class="archive-project-number">${esc(item.category || category).toUpperCase()}</span>
    </div>
    <div class="archive-project-body">
      <div><span class="tag">${esc(tags || category.toUpperCase())}</span><h3>${esc(item.title)}</h3><p>${esc(item.description || "")}</p></div>
      <span class="archive-project-link">VIEW PROJECT →</span>
    </div>
  </a>`;
}

async function load() {
  if (!client) {
    message.textContent = "Supabase is not configured yet. Add your project URL and publishable key to supabase-config.js.";
    return;
  }
  const { data, error } = await client.from("content").select("*, content_files(*)").eq("type","project").eq("published",true).eq("category",category).order("created_at",{ascending:false});
  if (error) { message.textContent = error.message; return; }
  if (!data?.length) { message.textContent = "No published projects in this archive yet. Add projects from the Admin page."; grid.innerHTML = ""; return; }
  message.textContent = `${data.length} project${data.length === 1 ? "" : "s"} in this archive.`;
  grid.innerHTML = data.map(card).join("");
}
load();
