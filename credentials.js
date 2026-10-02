const cfg = window.SUPABASE_CONFIG;
const client = cfg?.url && !cfg.url.includes("PASTE_YOUR")
  ? window.supabase.createClient(cfg.url, cfg.anonKey)
  : null;

const params = new URLSearchParams(location.search);
const selectedCategory = params.get("category") || "all";
const grid = document.getElementById("credentialArchiveGrid");
const message = document.getElementById("credentialArchiveMessage");
const viewer = document.getElementById("credentialViewer");
const viewerContent = document.getElementById("viewerContent");
const viewerTitle = document.getElementById("viewerTitle");
const viewerKind = document.getElementById("viewerKind");
const viewerOpen = document.getElementById("viewerOpen");
const viewerClose = document.getElementById("viewerClose");

const pageMeta = {
  all: {
    title: "Credentials",
    description: "A visual archive of certifications, professional memberships, conference presentations, awards and training."
  },
  certification: {
    title: "Certifications",
    description: "Professional and technical certifications documenting engineering skills and continued development."
  },
  membership: {
    title: "Memberships",
    description: "Professional society memberships and engineering community affiliations."
  },
  presentation: {
    title: "Presentations",
    description: "Conference presentations, posters and technical presentation records."
  },
  competition: {
    title: "Awards",
    description: "Competition results, academic achievements and professional recognition."
  },
  training: {
    title: "Training",
    description: "Industrial attachment, technical training and engineering development records."
  }
};

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c]));
}

function publicUrl(file) {
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

function credentialKind(item) {
  const c = String(item.category || "").toLowerCase();

  if (c === "membership") return "membership";
  if (["presentation", "conference", "poster"].includes(c)) return "presentation";
  if (c === "training") return "training";
  if (item.type === "award" || c === "competition") return "competition";
  return "certification";
}

function credentialLabel(kind) {
  return {
    certification: "CERTIFICATION",
    membership: "MEMBERSHIP",
    presentation: "PRESENTATION",
    competition: "AWARD",
    training: "TRAINING"
  }[kind] || "CREDENTIAL";
}

function dateText(item) {
  if (!item.date) return "";
  return new Date(item.date + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "short"
  });
}

function primaryFile(item) {
  const files = filesOf(item);
  return files.find(f => f.file_role === "thumbnail" && isImage(f))
    || files.find(isImage)
    || files.find(isPdf)
    || files[0]
    || null;
}

function card(item) {
  const kind = credentialKind(item);
  const file = primaryFile(item);
  const url = publicUrl(file);
  const image = file && isImage(file) ? url : "";
  const pdf = file && isPdf(file);
  const date = dateText(item);
  const issuer = item.issuer || "";

  return `
    <button
      class="credential-flashcard"
      type="button"
      data-id="${esc(item.id)}"
      aria-label="Open ${esc(item.title)}"
    >
      <div class="credential-card-visual ${image ? "has-image" : "document-card"}">
        ${image
          ? `<img src="${esc(image)}" alt="${esc(item.title)}" loading="lazy">`
          : `<div class="document-mark"><strong>${pdf ? "PDF" : credentialLabel(kind)}</strong><span>${pdf ? "CERTIFICATE" : "OPEN RECORD"}</span></div>`}
        <span class="credential-card-type">${esc(credentialLabel(kind))}</span>
      </div>

      <div class="credential-card-body">
        <div class="credential-card-meta">
          <span>${esc(kind.toUpperCase())}</span>
          <span>${esc(date)}</span>
        </div>
        <h3>${esc(item.title)}</h3>
        ${issuer ? `<p>${esc(issuer)}</p>` : `<p>${esc(item.description || "")}</p>`}
        <span class="credential-card-action">VIEW FULL DOCUMENT →</span>
      </div>
    </button>
  `;
}

function matchesCategory(item) {
  return selectedCategory === "all" || credentialKind(item) === selectedCategory;
}

function setPageMeta() {
  const meta = pageMeta[selectedCategory] || pageMeta.all;
  document.getElementById("credentialPageTitle").textContent = meta.title;
  document.getElementById("credentialPageDescription").textContent = meta.description;
  document.title = `${meta.title} — Tanbir Hasan`;

  document.querySelectorAll("#credentialCategoryNav a").forEach(link => {
    link.classList.toggle("active", link.dataset.category === selectedCategory);
  });
}

function openViewer(item) {
  const file = primaryFile(item);
  const url = publicUrl(file);
  const kind = credentialKind(item);

  viewerTitle.textContent = item.title || "Credential";
  viewerKind.textContent = credentialLabel(kind);
  viewerOpen.href = url || item.external_url || "#";
  viewerOpen.style.display = (url || item.external_url) ? "inline-flex" : "none";

  if (file && isImage(file) && url) {
    viewerContent.innerHTML = `<img class="viewer-image" src="${esc(url)}" alt="${esc(item.title)}">`;
  } else if (file && isPdf(file) && url) {
    viewerContent.innerHTML = `<iframe class="viewer-pdf" src="${esc(url)}#toolbar=1&navpanes=0" title="${esc(item.title)}"></iframe>`;
  } else if (url) {
    viewerContent.innerHTML = `
      <div class="viewer-file-fallback">
        <div class="document-mark"><strong>FILE</strong><span>${esc(file.original_name || "DOCUMENT")}</span></div>
        <a class="btn lime" href="${esc(url)}" target="_blank" rel="noopener">OPEN / DOWNLOAD ↗</a>
      </div>`;
  } else if (item.external_url) {
    viewerContent.innerHTML = `
      <div class="viewer-file-fallback">
        <div class="document-mark"><strong>LINK</strong><span>EXTERNAL RECORD</span></div>
        <a class="btn lime" href="${esc(item.external_url)}" target="_blank" rel="noopener">OPEN RECORD ↗</a>
      </div>`;
  } else {
    viewerContent.innerHTML = `<div class="viewer-file-fallback"><p>No public document is attached to this record yet.</p></div>`;
  }

  viewer.classList.add("open");
  viewer.setAttribute("aria-hidden", "false");
  document.body.classList.add("viewer-open");
  viewerClose.focus();
}

function closeViewer() {
  viewer.classList.remove("open");
  viewer.setAttribute("aria-hidden", "true");
  viewerContent.innerHTML = "";
  document.body.classList.remove("viewer-open");
}

viewerClose.addEventListener("click", closeViewer);
viewer.querySelector("[data-close-viewer]").addEventListener("click", closeViewer);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && viewer.classList.contains("open")) closeViewer();
});

async function load() {
  setPageMeta();

  if (!client) {
    message.textContent = "Supabase is not configured yet. Add your project URL and publishable key to supabase-config.js.";
    return;
  }

  const { data, error } = await client
    .from("content")
    .select("*, content_files(*)")
    .eq("published", true)
    .in("type", ["certification", "award", "publication", "other"])
    .order("date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    message.textContent = error.message;
    return;
  }

  const items = (data || []).filter(matchesCategory);

  message.textContent = `${items.length} ${items.length === 1 ? "record" : "records"}`;

  if (!items.length) {
    grid.innerHTML = `<div class="credential-empty"><strong>No records yet.</strong><p>Add a published credential from the Admin page and it will appear here automatically.</p></div>`;
    return;
  }

  grid.innerHTML = items.map(card).join("");
  grid.querySelectorAll(".credential-flashcard").forEach(button => {
    const item = items.find(x => x.id === button.dataset.id);
    if (item) button.addEventListener("click", () => openViewer(item));
  });
}

load();
