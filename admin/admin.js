const cfg = window.SUPABASE_CONFIG;
const { createClient } = supabase;
const client = createClient(cfg.url, cfg.anonKey);
const $ = (id) => document.getElementById(id);

const loginView = $('loginView');
const mfaView = $('mfaView');
const enrollView = $('enrollView');
const appView = $('appView');
const type = $('type');
const category = $('category');

const categories = {
  project: [['cad','CAD'],['cfd','CFD'],['fea','FEA'],['robotics-projects','Robotics & Projects']],
  research: [['research','Research'],['ai','AI / ML'],['cfd','CFD'],['materials','Materials'],['manufacturing','Manufacturing'],['robotics','Robotics']],
  publication: [['journal','Journal'],['conference','Conference'],['presentation','Presentation'],['poster','Poster'],['preprint','Preprint'],['manuscript','Manuscript']],
  certification: [['certification','Certification'],['design','Design / CAD'],['simulation','Simulation'],['additive','Additive Manufacturing'],['engineering','Engineering'],['other','Other']],
  membership: [['membership','Membership']],
  presentation: [['presentation','Presentation'],['conference','Conference'],['poster','Poster']],
  training: [['training','Training'],['industrial-attachment','Industrial Attachment'],['workshop','Workshop']],
  award: [['competition','Competition'],['academic','Academic'],['professional','Professional'],['other','Other']],
  media: [['image','Image'],['video','Video'],['figure','Figure'],['presentation','Presentation']],
  other: [['other','Other']]
};

function updateCategory() {
  category.innerHTML = (categories[type.value] || categories.other).map(([v,l]) => `<option value="${v}">${l}</option>`).join('');
  const isProject = type.value === 'project';
  const isResearch = type.value === 'research';
  const isCredential = ['certification','membership','presentation','training','award'].includes(type.value);
  $('projectFiles').style.display = isProject ? 'grid' : 'none';
  $('projectDetails').style.display = isProject ? 'grid' : 'none';
  $('projectKindWrap').style.display = isProject ? 'block' : 'none';
  $('researchFiles').style.display = isResearch ? 'grid' : 'none';
  $('credentialFiles').style.display = isCredential ? 'grid' : 'none';
  $('generalFiles').style.display = (!isProject && !isResearch && !isCredential) ? 'grid' : 'none';
  $('issuerWrap').style.display = isCredential || type.value === 'publication' || type.value === 'training' ? 'block' : 'none';
  $('credentialWrap').style.display = ['certification','membership'].includes(type.value) ? 'block' : 'none';
  $('statusWrap').style.display = ['research','publication','certification','membership','presentation','training','award'].includes(type.value) ? 'block' : 'none';
}

function msg(el, text) { el.textContent = text || ''; }
function show(view) { [loginView,mfaView,enrollView,appView].forEach(v=>v.classList.add('hidden')); view.classList.remove('hidden'); }
function isAdmin(user) { return user?.app_metadata?.role === 'admin'; }
async function currentSession(){const {data,error}=await client.auth.getSession();if(error)throw error;return data.session;}

async function beginMfaEnrollment(){
  msg($('enrollMessage'),'Creating your authenticator setup…'); $('qrBox').innerHTML=''; $('enrollSecret').textContent='';
  const factors=await client.auth.mfa.listFactors(); if(factors.error)throw factors.error;
  for(const factor of (factors.data?.totp||[])){if(factor.status!=='verified'){const removed=await client.auth.mfa.unenroll({factorId:factor.id});if(removed.error)console.warn(removed.error.message);}}
  const {data,error}=await client.auth.mfa.enroll({factorType:'totp',friendlyName:'Tanbir Portfolio Admin'}); if(error)throw error;
  window.pendingFactorId=data.id; if(data.totp?.qr_code)$('qrBox').innerHTML=data.totp.qr_code; $('enrollSecret').textContent=data.totp?.secret||'';
  msg($('enrollMessage'),'Scan the QR code with your authenticator app, then enter the 6-digit code.');
}
async function verifyEnrollment(){
  const code=$('enrollCode').value.trim(); if(!/^\d{6}$/.test(code)){msg($('enrollMessage'),'Enter the 6-digit code from your authenticator app.');return;}
  if(!window.pendingFactorId){msg($('enrollMessage'),'The setup session is missing. Refresh the page and try again.');return;}
  const challenge=await client.auth.mfa.challenge({factorId:window.pendingFactorId}); if(challenge.error){msg($('enrollMessage'),challenge.error.message);return;}
  const verify=await client.auth.mfa.verify({factorId:window.pendingFactorId,challengeId:challenge.data.id,code}); if(verify.error){msg($('enrollMessage'),verify.error.message);return;}
  window.pendingFactorId=null; await enterApp();
}
async function challengeExistingMfa(){
  msg($('mfaMessage'),''); const factors=await client.auth.mfa.listFactors(); if(factors.error){msg($('mfaMessage'),factors.error.message);return;}
  const factor=(factors.data?.totp||[]).find(x=>x.status==='verified');
  if(!factor){show(enrollView);try{await beginMfaEnrollment();}catch(e){msg($('enrollMessage'),e.message)}return;}
  window.activeFactorId=factor.id; show(mfaView); $('mfaCode').focus(); msg($('mfaMessage'),'Enter the 6-digit code from your authenticator app.');
}
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();msg($('loginMessage'),'Signing in…');const {data,error}=await client.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){msg($('loginMessage'),error.message);return;}if(!isAdmin(data.user)){await client.auth.signOut();msg($('loginMessage'),'This account is not authorized as the portfolio admin.');return;}try{const aal=await client.auth.mfa.getAuthenticatorAssuranceLevel();if(aal.error)throw aal.error;if(aal.data?.nextLevel==='aal2'&&aal.data?.currentLevel!=='aal2'){await challengeExistingMfa();}else{const factors=await client.auth.mfa.listFactors();if(factors.error)throw factors.error;const verified=(factors.data?.totp||[]).some(x=>x.status==='verified');if(!verified){show(enrollView);await beginMfaEnrollment();}else await enterApp();}}catch(e){msg($('loginMessage'),e.message||'Unable to start secure sign-in.');}});
$('mfaForm').addEventListener('submit',async e=>{e.preventDefault();const code=$('mfaCode').value.trim();if(!/^\d{6}$/.test(code)){msg($('mfaMessage'),'Enter the 6-digit code.');return;}if(!window.activeFactorId){msg($('mfaMessage'),'MFA factor is missing. Refresh and sign in again.');return;}const ch=await client.auth.mfa.challenge({factorId:window.activeFactorId});if(ch.error){msg($('mfaMessage'),ch.error.message);return;}const v=await client.auth.mfa.verify({factorId:window.activeFactorId,challengeId:ch.data.id,code});if(v.error){msg($('mfaMessage'),v.error.message);return;}await enterApp();});
$('enrollForm').addEventListener('submit',async e=>{e.preventDefault();try{await verifyEnrollment();}catch(err){msg($('enrollMessage'),err.message||'MFA setup failed.');}});
$('logout').onclick=async()=>{await client.auth.signOut();location.reload();};

async function enterApp(){const session=await currentSession();if(!session||!isAdmin(session.user)){await client.auth.signOut();show(loginView);msg($('loginMessage'),'This account is not authorized as the portfolio admin.');return;}const aal=await client.auth.mfa.getAuthenticatorAssuranceLevel();if(aal.data?.currentLevel!=='aal2'){await challengeExistingMfa();return;}show(appView);await load();}
async function load(){const {data,error}=await client.from('content').select('*').order('created_at',{ascending:false});if(error){alert(error.message);return;}window.items=data||[];renderStats();renderList();}
function renderStats(){const types=['project','research','publication','certification','award','media'];$('stats').innerHTML=types.map(t=>`<div class="stat"><strong>${window.items.filter(x=>x.type===t).length}</strong><span>${t.toUpperCase()}</span></div>`).join('');}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderList(){const q=$('search').value.toLowerCase();const data=window.items.filter(x=>`${x.title} ${x.type} ${x.category}`.toLowerCase().includes(q));$('contentList').innerHTML=data.length?data.map(x=>`<article class="item"><div><span class="pill">${esc(x.type)}</span><span class="status ${x.published?'published':'draft'}"> · ${x.published?'PUBLISHED':'DRAFT'}</span><h4>${esc(x.title)}</h4><p>${esc(x.category||'')} · ${esc((x.technologies||[]).join(' · '))}</p></div><button class="danger" data-id="${x.id}">Delete</button></article>`).join(''):'<p class="empty">No content yet.</p>';document.querySelectorAll('.danger').forEach(b=>b.onclick=()=>removeItem(b.dataset.id));}
async function removeItem(id){if(!confirm('Delete this item?'))return;const {error}=await client.from('content').delete().eq('id',id);if(error){alert(error.message);return;}await load();}
$('search').addEventListener('input',renderList);type.addEventListener('change',updateCategory);updateCategory();

function selectedFiles(){
  const out=[];
  const push=(id,role)=>{const el=$(id);if(el) [...el.files].forEach(file=>out.push({file,role}));};
  if(type.value==='project'){
    push('thumbnailFile','thumbnail');
    push('drawingFiles','drawing_2d');
    push('modelFiles','model_3d');
    push('cadSourceFiles','cad_source');
    push('projectImageFiles','project_image');
    push('resultImageFiles','simulation_result');
    push('simulationVideoFiles','simulation_animation');
    push('reportFiles','report');
    push('codeDataFiles','code_dataset');
    push('projectOtherFiles','attachment');
  } else if(type.value==='research'){
    push('researchThumbnailFile','thumbnail');
    push('researchPaperFile','paper');
    push('researchFigureFiles','research_figure');
    push('researchAttachmentFiles','attachment');
  } else if(['certification','membership','presentation','training','award'].includes(type.value)){
    push('credentialPreviewFile','credential');
    push('credentialAttachmentFiles','attachment');
  } else {
    push('files','attachment');
  }
  return out;
}


$('contentForm').addEventListener('submit',async e=>{
  e.preventDefault();
  msg($('formMessage'),'Saving…');
  const {data:{user}}=await client.auth.getUser();
  if(!user||!isAdmin(user)){msg($('formMessage'),'Your admin session is invalid.');return;}
  const aal=await client.auth.mfa.getAuthenticatorAssuranceLevel();
  if(aal.data?.currentLevel!=='aal2'){msg($('formMessage'),'MFA verification is required.');return;}

  const titleValue=$('title').value.trim();
  const slugBase=titleValue.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'portfolio-item';
  const slug=`${slugBase}-${crypto.randomUUID().slice(0,8)}`;
  const row={
    type:type.value,
    title:titleValue,
    slug,
    category:category.value,
    description:$('description').value.trim(),
    project_kind:type.value==='project' ? $('projectKind').value : null,
    project_overview:type.value==='project' ? $('projectOverview').value.trim() : null,
    objectives:type.value==='project' ? $('objectives').value.trim() : null,
    methodology:type.value==='project' ? $('methodology').value.trim() : null,
    results:type.value==='project' ? $('results').value.trim() : null,
    technologies:$('technologies').value.split(',').map(s=>s.trim()).filter(Boolean),
    external_url:$('externalUrl').value.trim()||null,
    date:$('date').value||null,
    issuer:$('issuer').value.trim()||null,
    credential_id:$('credentialId').value.trim()||null,
    status:$('status').value.trim()||null,
    featured:$('featured').checked,
    published:$('published').checked,
    owner_id:user.id
  };

  const ins=await client.from('content').insert(row).select().single();
  if(ins.error){msg($('formMessage'),ins.error.message);return;}

  const selected=selectedFiles();
  let failures=0;
  for(let i=0;i<selected.length;i++){
    const {file,role}=selected[i];
    const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'-');
    const path=`${user.id}/${ins.data.id}/${crypto.randomUUID()}-${safeName}`;
    const up=await client.storage.from('portfolio-public').upload(path,file,{upsert:false,contentType:file.type||undefined});
    if(up.error){
      failures++;
      console.error('Upload failed',file.name,up.error);
      continue;
    }
    const meta={content_id:ins.data.id,bucket:'portfolio-public',storage_path:path,original_name:file.name,mime:file.type||null,size_bytes:file.size,file_role:role,sort_order:i,owner_id:user.id};
    const m=await client.from('content_files').insert(meta);
    if(m.error){failures++;console.error('Metadata failed',file.name,m.error);}
  }

  msg($('formMessage'),failures ? `Saved, but ${failures} file(s) failed. Check the browser console for details.` : `Saved to portfolio with ${selected.length} file(s).`);
  e.target.reset();
  $('published').checked=true;
  updateCategory();
  await load();
});


(async()=>{try{const session=await currentSession();if(!session){show(loginView);return;}if(!isAdmin(session.user)){await client.auth.signOut();show(loginView);msg($('loginMessage'),'This account is not authorized as the portfolio admin.');return;}const aal=await client.auth.mfa.getAuthenticatorAssuranceLevel();if(aal.data?.currentLevel==='aal2')await enterApp();else await challengeExistingMfa();}catch(e){show(loginView);msg($('loginMessage'),e.message||'Unable to load the admin panel.');}})();
