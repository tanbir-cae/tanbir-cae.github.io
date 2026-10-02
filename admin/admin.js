const cfg = window.SUPABASE_CONFIG;

if (!cfg?.url || !cfg?.anonKey) {
  throw new Error(
    "Supabase configuration is missing. Check supabase-config.js."
  );
}

const { createClient } = supabase;

const client = createClient(cfg.url, cfg.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

const $ = (id) => document.getElementById(id);

const loginView = $("loginView");
const mfaView = $("mfaView");
const appView = $("appView");

const loginForm = $("loginForm");
const mfaForm = $("mfaForm");
const contentForm = $("contentForm");

const type = $("type");
const category = $("category");

const categories = {
  project: [
    ["general", "General"],
    ["cad", "CAD"],
    ["cfd", "CFD"],
    ["fea", "FEA"],
    ["ai", "AI / ML"],
    ["robotics", "Robotics"],
    ["manufacturing", "Manufacturing"],
    ["software", "Software"],
    ["iot", "IoT / Automation"]
  ],

  research: [
    ["research", "Research"],
    ["ai", "AI / ML"],
    ["cfd", "CFD"],
    ["materials", "Materials"],
    ["manufacturing", "Manufacturing"],
    ["robotics", "Robotics"]
  ],

  publication: [
    ["journal", "Journal"],
    ["conference", "Conference"],
    ["presentation", "Presentation"],
    ["poster", "Poster"],
    ["preprint", "Preprint"],
    ["manuscript", "Manuscript"]
  ],

  certification: [
    ["design", "Design / CAD"],
    ["simulation", "Simulation"],
    ["additive", "Additive Manufacturing"],
    ["engineering", "Engineering"],
    ["training", "Training"],
    ["membership", "Membership"],
    ["conference", "Conference"],
    ["ai", "AI / ML"],
    ["other", "Other"]
  ],

  award: [
    ["academic", "Academic"],
    ["competition", "Competition"],
    ["professional", "Professional"],
    ["other", "Other"]
  ],

  media: [
    ["image", "Image"],
    ["video", "Video"],
    ["3d", "3D Model"],
    ["figure", "Figure"],
    ["presentation", "Presentation"]
  ],

  other: [
    ["other", "Other"]
  ]
};

let currentMfaFactorId = null;
let enrollmentMode = false;


/* =========================================================
   HELPERS
========================================================= */

function msg(element, text = "") {
  if (element) {
    element.textContent = text;
  }
}

function setBusy(button, busy, busyText = "Working…") {
  if (!button) return;

  if (busy) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.textContent = busyText;
  } else {
    button.disabled = false;
    button.textContent =
      button.dataset.originalText || button.textContent;
  }
}

function updateCategory() {
  if (!category || !type) return;

  const options = categories[type.value] || categories.other;

  category.innerHTML = options
    .map(
      ([value, label]) =>
        `<option value="${value}">${label}</option>`
    )
    .join("");
}

function showLogin(message = "") {
  loginView?.classList.remove("hidden");
  mfaView?.classList.add("hidden");
  appView?.classList.add("hidden");

  msg($("loginMessage"), message);
  msg($("mfaMessage"), "");
}

function showMfa(message = "") {
  loginView?.classList.add("hidden");
  mfaView?.classList.remove("hidden");
  appView?.classList.add("hidden");

  msg($("mfaMessage"), message);
}

function showApp() {
  loginView?.classList.add("hidden");
  mfaView?.classList.add("hidden");
  appView?.classList.remove("hidden");
}


/* =========================================================
   AUTHENTICATION
========================================================= */

/*
 * The dashboard is accessible ONLY when:
 *
 * 1. A valid Supabase session exists
 * 2. The authenticated user has app_metadata.role === "admin"
 * 3. MFA has reached AAL2
 */
async function requireMfaSession() {
  const {
    data: { session },
    error: sessionError
  } = await client.auth.getSession();

  if (sessionError || !session) {
    return null;
  }

  const {
    data: { user },
    error: userError
  } = await client.auth.getUser();

  if (userError || !user) {
    return null;
  }

  /*
   * ADMIN ROLE CHECK
   */
  if (user.app_metadata?.role !== "admin") {
    return null;
  }

  /*
   * MFA / AAL2 CHECK
   */
  const {
    data: aal,
    error: aalError
  } = await client.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalError) {
    return null;
  }

  if (aal?.currentLevel !== "aal2") {
    return null;
  }

  return {
    session,
    user,
    aal
  };
}


/* =========================================================
   MFA
========================================================= */

async function getMfaState() {
  const {
    data,
    error
  } = await client.auth.mfa.getAuthenticatorAssuranceLevel();

  if (error) {
    return {
      error,
      currentLevel: null,
      nextLevel: null
    };
  }

  return {
    error: null,
    currentLevel: data?.currentLevel ?? null,
    nextLevel: data?.nextLevel ?? null
  };
}


async function getVerifiedTotpFactor() {
  const {
    data,
    error
  } = await client.auth.mfa.listFactors();

  if (error) {
    return {
      factor: null,
      error
    };
  }

  const factor =
    data?.totp?.find(
      (item) => item.status === "verified"
    ) || null;

  return {
    factor,
    error: null
  };
}


/* =========================================================
   FIRST-TIME MFA ENROLLMENT UI
========================================================= */

function ensureEnrollmentUI() {
  if (!mfaView) return null;

  let box = $("mfaEnrollment");

  if (box) {
    return box;
  }

  box = document.createElement("div");

  box.id = "mfaEnrollment";

  box.style.marginTop = "18px";
  box.style.padding = "16px";
  box.style.border = "1px solid var(--border, #e1e5eb)";
  box.style.borderRadius = "10px";
  box.style.background = "var(--accent-soft, #e8eff6)";

  box.innerHTML = `
    <strong>Authenticator setup required</strong>

    <p id="enrollmentMessage">
      Set up an authenticator app before entering the admin dashboard.
    </p>

    <div
      id="enrollmentQrWrap"
      style="display:none;margin:14px 0;text-align:center;"
    >
      <img
        id="enrollmentQr"
        alt="Scan this QR code with your authenticator app"
        style="
          max-width:220px;
          width:100%;
          background:#fff;
          padding:10px;
          border-radius:8px;
        "
      >
    </div>

    <label
      id="enrollmentSecretWrap"
      style="display:none;"
    >
      Manual setup key

      <input
        id="enrollmentSecret"
        readonly
      >
    </label>

    <button
      id="startEnrollment"
      class="primary"
      type="button"
    >
      Set up authenticator
    </button>

    <input
      id="enrollmentCode"
      inputmode="numeric"
      pattern="[0-9]{6}"
      maxlength="6"
      placeholder="6-digit code"
      autocomplete="one-time-code"
      style="display:none;margin-top:10px;"
    >

    <button
      id="verifyEnrollment"
      class="primary"
      type="button"
      style="display:none;margin-top:10px;"
    >
      Verify authenticator
    </button>
  `;

  const form = mfaView.querySelector("form");

  if (form) {
    form.after(box);
  } else {
    mfaView.appendChild(box);
  }

  $("startEnrollment")?.addEventListener(
    "click",
    startEnrollment
  );

  $("verifyEnrollment")?.addEventListener(
    "click",
    verifyEnrollment
  );

  return box;
}


function resetEnrollmentUI() {
  const box = $("mfaEnrollment");

  if (!box) return;

  $("enrollmentQrWrap").style.display = "none";
  $("enrollmentSecretWrap").style.display = "none";
  $("enrollmentCode").style.display = "none";
  $("verifyEnrollment").style.display = "none";
  $("startEnrollment").style.display = "inline-block";

  $("enrollmentSecret").value = "";
  $("enrollmentCode").value = "";

  msg(
    $("enrollmentMessage"),
    "Set up an authenticator app before entering the admin dashboard."
  );
}


/* =========================================================
   START MFA ENROLLMENT
========================================================= */

async function startEnrollment() {
  const button = $("startEnrollment");

  setBusy(
    button,
    true,
    "Creating setup…"
  );

  msg(
    $("enrollmentMessage"),
    "Creating a new authenticator factor…"
  );

  try {
    const {
      data,
      error
    } = await client.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Tanbir Portfolio Admin"
    });

    if (error) {
      throw error;
    }

    currentMfaFactorId = data?.id || null;

    if (!currentMfaFactorId || !data?.totp) {
      throw new Error(
        "Supabase did not return a TOTP enrollment."
      );
    }

    /*
     * QR CODE
     */
    if (data.totp.qr_code) {
      $("enrollmentQr").src =
        data.totp.qr_code;

      $("enrollmentQrWrap").style.display =
        "block";
    }

    /*
     * MANUAL SECRET
     */
    if (data.totp.secret) {
      $("enrollmentSecret").value =
        data.totp.secret;

      $("enrollmentSecretWrap").style.display =
        "grid";
    }

    $("enrollmentCode").style.display =
      "block";

    $("verifyEnrollment").style.display =
      "inline-block";

    $("startEnrollment").style.display =
      "none";

    msg(
      $("enrollmentMessage"),
      "Scan the QR code with Google Authenticator, Microsoft Authenticator, 1Password, or another TOTP app, then enter the 6-digit code."
    );

  } catch (error) {

    msg(
      $("enrollmentMessage"),
      error?.message ||
        "Could not start MFA enrollment."
    );

  } finally {

    setBusy(
      button,
      false
    );
  }
}


/* =========================================================
   VERIFY FIRST-TIME MFA
========================================================= */

async function verifyEnrollment() {
  const code =
    $("enrollmentCode")?.value.trim();

  const button =
    $("verifyEnrollment");

  if (!currentMfaFactorId) {
    msg(
      $("enrollmentMessage"),
      "Start authenticator setup first."
    );

    return;
  }

  if (!/^\d{6}$/.test(code)) {
    msg(
      $("enrollmentMessage"),
      "Enter the 6-digit authenticator code."
    );

    return;
  }

  setBusy(
    button,
    true,
    "Verifying…"
  );

  msg(
    $("enrollmentMessage"),
    "Verifying your authenticator…"
  );

  try {

    const {
      data: challenge,
      error: challengeError
    } = await client.auth.mfa.challenge({
      factorId: currentMfaFactorId
    });

    if (challengeError) {
      throw challengeError;
    }

    const {
      error: verifyError
    } = await client.auth.mfa.verify({
      factorId: currentMfaFactorId,
      challengeId: challenge.id,
      code
    });

    if (verifyError) {
      throw verifyError;
    }

    /*
     * Refresh session so AAL2 is available.
     */
    const {
      error: refreshError
    } = await client.auth.refreshSession();

    if (refreshError) {
      throw refreshError;
    }

    enrollmentMode = false;
    currentMfaFactorId = null;

    await enterApp();

  } catch (error) {

    msg(
      $("enrollmentMessage"),
      error?.message ||
        "MFA verification failed."
    );

  } finally {

    setBusy(
      button,
      false
    );
  }
}


/* =========================================================
   START MFA LOGIN FLOW
========================================================= */

async function beginMfaFlow() {
  ensureEnrollmentUI();

  const {
    error,
    currentLevel,
    nextLevel
  } = await getMfaState();

  if (error) {
    await client.auth.signOut();

    showLogin(error.message);

    return;
  }

  /*
   * Already AAL2
   */
  if (currentLevel === "aal2") {
    await enterApp();

    return;
  }

  const {
    factor,
    error: factorError
  } = await getVerifiedTotpFactor();

  if (factorError) {
    await client.auth.signOut();

    showLogin(
      factorError.message
    );

    return;
  }

  /*
   * Existing verified MFA factor
   */
  if (factor) {

    enrollmentMode = false;

    resetEnrollmentUI();

    showMfa(
      "Enter the 6-digit code from your authenticator app."
    );

    return;
  }

  /*
   * No verified factor.
   * First-time MFA setup.
   */
  enrollmentMode = true;

  resetEnrollmentUI();

  showMfa(
    "Your admin account needs to finish authenticator setup."
  );
}


/* =========================================================
   ENTER DASHBOARD
========================================================= */

async function enterApp() {

  const auth =
    await requireMfaSession();

  /*
   * IMPORTANT:
   * If password/MFA/admin verification fails,
   * NEVER show the dashboard.
   */
  if (!auth) {

    await client.auth.signOut();

    showLogin(
      "Admin access requires a valid password, admin role, and MFA verification."
    );

    return;
  }

  showApp();

  await load();
}


/* =========================================================
   LOGIN
========================================================= */

loginForm?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const email =
      $("email")?.value.trim();

    const password =
      $("password")?.value || "";

    const button =
      loginForm.querySelector(
        "button[type='submit']"
      );

    if (!email || !password) {

      msg(
        $("loginMessage"),
        "Enter your email and password."
      );

      return;
    }

    setBusy(
      button,
      true,
      "Signing in…"
    );

    msg(
      $("loginMessage"),
      "Checking credentials…"
    );

    try {

      /*
       * CRITICAL:
       *
       * Clear any previous local session first.
       *
       * This prevents an old valid session from making
       * a wrong-password attempt appear successful.
       */
      await client.auth.signOut({
        scope: "local"
      });

      /*
       * ACTUAL PASSWORD VALIDATION
       */
      const {
        data,
        error
      } = await client.auth.signInWithPassword({
        email,
        password
      });

      /*
       * WRONG PASSWORD
       *
       * Stop immediately.
       */
      if (
        error ||
        !data?.session ||
        !data?.user
      ) {

        await client.auth.signOut({
          scope: "local"
        });

        msg(
          $("loginMessage"),
          error?.message ||
            "Invalid email or password."
        );

        return;
      }

      /*
       * Verify the user directly from Supabase.
       */
      const {
        data: {
          user
        },
        error: userError
      } = await client.auth.getUser();

      if (
        userError ||
        !user
      ) {

        await client.auth.signOut({
          scope: "local"
        });

        msg(
          $("loginMessage"),
          "Could not verify your account."
        );

        return;
      }

      /*
       * ADMIN ROLE CHECK
       */
      if (
        user.app_metadata?.role !== "admin"
      ) {

        await client.auth.signOut({
          scope: "local"
        });

        msg(
          $("loginMessage"),
          "This account is not authorized as the portfolio admin."
        );

        return;
      }

      /*
       * PASSWORD IS CORRECT.
       *
       * Now MFA is required.
       */
      await beginMfaFlow();

    } catch (error) {

      await client.auth.signOut({
        scope: "local"
      });

      msg(
        $("loginMessage"),
        error?.message ||
          "Sign-in failed."
      );

    } finally {

      setBusy(
        button,
        false
      );
    }
  }
);


/* =========================================================
   MFA LOGIN
========================================================= */

mfaForm?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    if (enrollmentMode) {
      return;
    }

    const code =
      $("mfaCode")?.value.trim();

    const button =
      mfaForm.querySelector(
        "button[type='submit']"
      );

    if (!/^\d{6}$/.test(code)) {

      msg(
        $("mfaMessage"),
        "Enter the 6-digit authenticator code."
      );

      return;
    }

    setBusy(
      button,
      true,
      "Verifying…"
    );

    msg(
      $("mfaMessage"),
      "Verifying your authenticator code…"
    );

    try {

      const {
        factor,
        error: factorError
      } = await getVerifiedTotpFactor();

      if (factorError) {
        throw factorError;
      }

      if (!factor) {

        msg(
          $("mfaMessage"),
          "No verified authenticator factor was found."
        );

        enrollmentMode = true;

        resetEnrollmentUI();

        return;
      }

      /*
       * Create MFA challenge.
       */
      const {
        data: challenge,
        error: challengeError
      } = await client.auth.mfa.challenge({
        factorId: factor.id
      });

      if (challengeError) {
        throw challengeError;
      }

      /*
       * Verify 6-digit TOTP.
       */
      const {
        error: verifyError
      } = await client.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challenge.id,
        code
      });

      if (verifyError) {
        throw verifyError;
      }

      /*
       * Refresh session to receive AAL2.
       */
      const {
        error: refreshError
      } = await client.auth.refreshSession();

      if (refreshError) {
        throw refreshError;
      }

      $("mfaCode").value = "";

      await enterApp();

    } catch (error) {

      msg(
        $("mfaMessage"),
        error?.message ||
          "MFA verification failed."
      );

    } finally {

      setBusy(
        button,
        false
      );
    }
  }
);


/* =========================================================
   LOGOUT
========================================================= */

$("logout")?.addEventListener(
  "click",
  async () => {

    const button =
      $("logout");

    setBusy(
      button,
      true,
      "Signing out…"
    );

    try {

      await client.auth.signOut({
        scope: "local"
      });

    } finally {

      window.location.replace("./");
    }
  }
);


/* =========================================================
   DATABASE / CMS
========================================================= */

async function load() {

  const {
    data,
    error
  } = await client
    .from("content")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {

    msg(
      $("formMessage"),
      error.message
    );

    return;
  }

  window.items = data || [];

  renderStats();
  renderList();
}


function renderStats() {

  const types = [
    "project",
    "research",
    "publication",
    "certification",
    "award",
    "media"
  ];

  $("stats").innerHTML =
    types
      .map(
        (t) =>
          `
          <div class="stat">
            <strong>
              ${
                window.items.filter(
                  (x) => x.type === t
                ).length
              }
            </strong>

            <span>
              ${t.toUpperCase()}
            </span>
          </div>
          `
      )
      .join("");
}


function esc(value) {

  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
  );
}


function renderList() {

  const q =
    ($("search")?.value || "")
      .toLowerCase();

  const data =
    (window.items || [])
      .filter(
        (item) =>
          `${item.title} ${item.type} ${item.category}`
            .toLowerCase()
            .includes(q)
      );

  $("contentList").innerHTML =
    data.length
      ? data
          .map(
            (item) =>
              `
              <article class="item">

                <div>

                  <span class="pill">
                    ${esc(item.type)}
                  </span>

                  <span
                    class="status ${
                      item.published
                        ? "published"
                        : "draft"
                    }"
                  >
                    ·
                    ${
                      item.published
                        ? "PUBLISHED"
                        : "DRAFT"
                    }
                  </span>

                  <h4>
                    ${esc(item.title)}
                  </h4>

                  <p>
                    ${esc(item.category || "")}
                    ·
                    ${esc(
                      (item.technologies || [])
                        .join(" · ")
                    )}
                  </p>

                </div>

                <button
                  class="danger"
                  data-id="${esc(item.id)}"
                >
                  Delete
                </button>

              </article>
              `
          )
          .join("")
      : `
        <p class="empty">
          No content yet.
        </p>
      `;

  document
    .querySelectorAll(".danger")
    .forEach(
      (button) => {

        button.onclick = () =>
          removeItem(
            button.dataset.id
          );
      }
    );
}


async function removeItem(id) {

  if (
    !id ||
    !confirm(
      "Delete this item?"
    )
  ) {
    return;
  }

  /*
   * Check authentication before deleting.
   */
  const auth =
    await requireMfaSession();

  if (!auth) {

    await client.auth.signOut();

    showLogin(
      "Your admin session has expired."
    );

    return;
  }

  const {
    error
  } = await client
    .from("content")
    .delete()
    .eq("id", id);

  if (error) {

    alert(error.message);

    return;
  }

  await load();
}


/* =========================================================
   SEARCH / CATEGORY
========================================================= */

$("search")?.addEventListener(
  "input",
  renderList
);

type?.addEventListener(
  "change",
  updateCategory
);

updateCategory();


/* =========================================================
   CREATE CONTENT
========================================================= */

contentForm?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    msg(
      $("formMessage"),
      "Checking admin session…"
    );

    /*
     * NEVER allow content creation without
     * admin + AAL2.
     */
    const auth =
      await requireMfaSession();

    if (!auth) {

      await client.auth.signOut();

      showLogin(
        "Your admin session has expired or MFA is no longer valid."
      );

      return;
    }

    const button =
      contentForm.querySelector(
        "button[type='submit']"
      );

    setBusy(
      button,
      true,
      "Saving…"
    );

    try {

      const title =
        $("title").value.trim();

      if (!title) {

        msg(
          $("formMessage"),
          "Title is required."
        );

        return;
      }

      const slugBase =
        title
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-|-$/g,
            ""
          );

      const slug =
        `${slugBase}-${crypto
          .randomUUID()
          .slice(0, 8)}`;

      const row = {

        type:
          type.value,

        title,

        slug,

        category:
          category.value,

        description:
          $("description")
            .value
            .trim(),

        technologies:
          $("technologies")
            .value
            .split(",")
            .map(
              (s) => s.trim()
            )
            .filter(Boolean),

        external_url:
          $("externalUrl")
            .value
            .trim() || null,

        date:
          $("date").value || null,

        issuer:
          $("issuer")
            .value
            .trim() || null,

        credential_id:
          $("credentialId")
            .value
            .trim() || null,

        status:
          $("status")
            .value
            .trim() || null,

        featured:
          $("featured").checked,

        published:
          $("published").checked,

        owner_id:
          auth.user.id
      };

      /*
       * Insert database record.
       */
      const {
        data: inserted,
        error: insertError
      } =
        await client
          .from("content")
          .insert(row)
          .select()
          .single();

      if (insertError) {

        msg(
          $("formMessage"),
          insertError.message
        );

        return;
      }

      /*
       * Upload attached files.
       */
      const files =
        $("files").files;

      const uploadErrors = [];

      for (
        const file of files
      ) {

        const safeName =
          file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "-"
          );

        const path =
          `${auth.user.id}/${
            inserted.id
          }/${
            crypto.randomUUID()
          }-${safeName}`;

        const {
          error: uploadError
        } =
          await client.storage
            .from(
              "portfolio-public"
            )
            .upload(
              path,
              file,
              {
                upsert: false
              }
            );

        if (uploadError) {

          uploadErrors.push(
            `${file.name}: ${uploadError.message}`
          );

          continue;
        }

        /*
         * Save file metadata.
         */
        const {
          error: metadataError
        } =
          await client
            .from("content_files")
            .insert({
              content_id:
                inserted.id,

              bucket:
                "portfolio-public",

              storage_path:
                path,

              original_name:
                file.name,

              mime:
                file.type || null,

              size_bytes:
                file.size,

              owner_id:
                auth.user.id
            });

        if (metadataError) {

          uploadErrors.push(
            `${file.name}: metadata save failed — ${metadataError.message}`
          );
        }
      }

      if (
        uploadErrors.length
      ) {

        msg(
          $("formMessage"),
          `Item saved, but some files had problems: ${uploadErrors.join(
            " | "
          )}`
        );

      } else {

        msg(
          $("formMessage"),
          "Saved successfully."
        );
      }

      contentForm.reset();

      $("published").checked =
        true;

      updateCategory();

      await load();

    } catch (error) {

      msg(
        $("formMessage"),
        error?.message ||
          "Could not save the item."
      );

    } finally {

      setBusy(
        button,
        false
      );
    }
  }
);


/* =========================================================
   INITIAL SESSION CHECK
========================================================= */

(async () => {

  try {

    const {
      data: {
        session
      }
    } =
      await client.auth.getSession();

    /*
     * No session.
     */
    if (!session) {

      showLogin();

      return;
    }

    /*
     * Existing session must STILL pass:
     * admin role + AAL2.
     */
    const auth =
      await requireMfaSession();

    if (auth) {

      await enterApp();

      return;
    }

    /*
     * Session exists but is not AAL2.
     * Check whether this is actually our admin.
     */
    const {
      data: {
        user
      }
    } =
      await client.auth.getUser();

    if (
      !user ||
      user.app_metadata?.role !== "admin"
    ) {

      await client.auth.signOut();

      showLogin(
        "Please sign in with the authorized admin account."
      );

      return;
    }

    /*
     * Correct admin but MFA not completed.
     */
    await beginMfaFlow();

  } catch (error) {

    await client.auth.signOut();

    showLogin(
      error?.message ||
        "Could not initialize the admin session."
    );
  }

})();
