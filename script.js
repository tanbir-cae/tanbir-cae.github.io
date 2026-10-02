const menu = document.getElementById("menu");
const nav = document.getElementById("nav");
const researchGrid = document.querySelector(".research-grid");
const mediaGrid = document.querySelector(".media-grid");

if (menu && nav) {
  menu.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
}

function esc(v) {
  return String(v ?? "").replace(/[&<>\"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}

function fileUrl(file) {
  if (!file) return "";
  const cfg = window.SUPABASE_CONFIG;
  if (!cfg?.url || !file.storage_path) return "";
  if (file.bucket === "portfolio-public") {
    return `${cfg.url}/storage/v1/object/public/${file.bucket}/${file.storage_path}`;
  }
  return "";
}

function renderResearch(items) {
  if (!researchGrid) return;
  const research = items.filter(x => x.type === "research");
  if (!research.length) {
    researchGrid.innerHTML = `
      <div class="research-empty-home">
        <strong>No research published yet.</strong>
        <p>Add your original research from the Admin page and publish it to display it here.</p>
        <a class="research-link" href="research.html">OPEN RESEARCH ARCHIVE →</a>
      </div>`;
    return;
  }
  researchGrid.innerHTML = research.slice(0, 3).map(x => `
    <article class="research-home-card">
      <span>${esc((x.category || "RESEARCH").toUpperCase())}</span>
      <h3>${esc(x.title)}</h3>
      <p>${esc(x.description || "")}</p>
      <small>${esc((x.technologies || []).join(" · ")).toUpperCase()}</small>
      <a class="research-link" href="research.html">VIEW RESEARCH →</a>
    </article>
  `).join("");
}

function credentialKind(x) {
  const c = String(x.category || "").toLowerCase();
  if (c === "membership") return "membership";
  if (["presentation", "conference", "poster"].includes(c)) return "presentation";
  if (c === "training") return "training";
  if (x.type === "award" || c === "competition") return "competition";
  return "certification";
}

function updateCredentialCount(items) {
  const countEl = document.getElementById("credentialCount");
  if (!countEl) return;
  const data = items.filter(x => ["certification", "award", "publication", "membership", "presentation", "training", "other"].includes(x.type));
  countEl.textContent = `${data.length} ${data.length === 1 ? "item" : "items"}`;
}

function renderMedia(items) {
  if (!mediaGrid) return;
  const media = items.filter(x => x.type === "media");
  if (!media.length) return;
  mediaGrid.innerHTML = media.map(x => {
    const f = x.files?.[0];
    const url = fileUrl(f);
    return `<div class="media-box dynamic-media">
      ${f && /^image\//.test(f.mime || "") ? `<img src="${esc(url)}" alt="${esc(x.title)}" loading="lazy">` : `<div class="media-placeholder">${esc(x.category || "MEDIA").toUpperCase()}</div>`}
      <div><b>${esc(x.title)}</b><p>${esc(x.description || "")}</p>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">OPEN FILE ↗</a>` : ""}</div>
    </div>`;
  }).join("");
}

async function start() {
  const cfg = window.SUPABASE_CONFIG;
  if (!cfg || !cfg.url || cfg.url.includes("PASTE_YOUR")) return;

  const { createClient } = window.supabase;
  window.supabaseClient = createClient(cfg.url, cfg.anonKey);

  const { data, error } = await window.supabaseClient
    .from("content")
    .select("*, content_files(*)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Portfolio content load failed:", error);
    return;
  }

  renderResearch(data || []);
  updateCredentialCount(data || []);
  renderMedia(data || []);
}

start();
