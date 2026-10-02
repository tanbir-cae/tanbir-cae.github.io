const cfg = window.SUPABASE_CONFIG;
const client = cfg?.url && !cfg.url.includes("PASTE_YOUR")
  ? window.supabase.createClient(cfg.url, cfg.anonKey)
  : null;

const grid = document.getElementById("researchArchiveGrid");
const message = document.getElementById("researchMessage");
const count = document.getElementById("researchCount");
const menu = document.getElementById("menu");
const nav = document.getElementById("nav");

if (menu && nav) {
  menu.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
}

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}

function fileUrl(file) {
  if (!file || file.bucket !== "portfolio-public" || !cfg?.url) return "";
  return `${cfg.url}/storage/v1/object/public/${file.bucket}/${file.storage_path}`;
}

function filesOf(item) {
  return Array.isArray(item.content_files) ? item.content_files : [];
}

function isImage(file) {
  return /^image\//i.test(file?.mime || "") || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(file?.original_name || "");
}

function isPdf(file) {
  return file?.mime === "application/pdf" || /\.pdf$/i.test(file?.original_name || "");
}

function coverFile(item) {
  const files = filesOf(item);
  return files.find(f => f.file_role === "thumbnail" && isImage(f))
    || files.find(f => f.file_role === "paper" && isPdf(f))
    || files.find(isImage)
    || files.find(isPdf)
    || files[0]
    || null;
}

function dateText(item) {
  if (!item.date) return "";
  return new Date(item.date + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric", month: "short"
  });
}

function card(item) {
  const file = coverFile(item);
  const url = fileUrl(file);
  const image = file && isImage(file) ? url : "";
  const pdf = file && isPdf(file);
  const category = item.category || "RESEARCH";
  const tags = (item.technologies || []).join(" · ");

  return `
    <article class="research-flashcard">
      <a href="${esc(item.external_url || (pdf && url ? url : "#"))}" ${item.external_url || (pdf && url) ? 'target="_blank" rel="noopener"' : ''}>
        <div class="research-card-visual ${image ? "has-image" : "document-card"}">
          ${image
            ? `<img src="${esc(image)}" alt="${esc(item.title)}" loading="lazy">`
            : `<div class="research-document-mark"><strong>${pdf ? "PDF" : "RESEARCH"}</strong><span>${pdf ? "PAPER" : "ARCHIVE RECORD"}</span></div>`}
          <span>${esc(String(category).toUpperCase())}</span>
        </div>
        <div class="research-card-body">
          <div class="research-card-meta">
            <span>${esc(dateText(item))}</span>
            <span>${esc(item.status || "RESEARCH")}</span>
          </div>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.description || "")}</p>
          ${tags ? `<small>${esc(tags.toUpperCase())}</small>` : ""}
          <b>${item.external_url || (pdf && url) ? "OPEN PAPER ↗" : "VIEW RESEARCH RECORD →"}</b>
        </div>
      </a>
    </article>
  `;
}

async function load() {
  if (!client) {
    message.textContent = "Supabase is not configured yet. Add your project URL and publishable key to supabase-config.js.";
    return;
  }

  const { data, error } = await client
    .from("content")
    .select("*, content_files(*)")
    .eq("published", true)
    .eq("type", "research")
    .order("date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    message.textContent = error.message;
    return;
  }

  const items = data || [];
  count.textContent = `${items.length} ${items.length === 1 ? "record" : "records"}`;

  if (!items.length) {
    grid.innerHTML = `<div class="research-empty"><strong>Your research archive is ready.</strong><p>Add your original papers from the Admin page. Once published, they will appear here automatically.</p></div>`;
    return;
  }

  grid.innerHTML = items.map(card).join("");
}

load();
