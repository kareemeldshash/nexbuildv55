// STEP 1: paste your two values from Supabase > Project Settings > API
const SUPABASE_URL = "https://bwctasiftanzitpxjhqe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3Y3Rhc2lmdGFueml0cHhqaHFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNTY2MjEsImV4cCI6MjEwNzgzMjYyMX0.LLP3fJgN78DGwC225xP3iQzAhviYO0n09j8dwFCgM2Q";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cardHTML = p => `<article class="card"><div class="thumb">${p.image_url ? `<img src="${esc(p.image_url)}" alt="">` : esc((p.title||"?")[0])}</div><div class="in"><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><span class="price">${Number(p.price) > 0 ? "$" + Number(p.price) : "Free"}</span></div></article>`;

async function googleLogin() {
  const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + "/index.html" } });
  if (error) document.getElementById("msg").textContent = error.message;
}
sb.auth.getSession().then(({ data }) => {
  const s = document.getElementById("authSlot"); if (!s) return;
  s.innerHTML = data.session ? '<a href="#" id="out">Sign out</a>' : '<a class="btn small" href="login.html">Sign in</a>';
  const o = document.getElementById("out");
  if (o) o.onclick = async e => { e.preventDefault(); await sb.auth.signOut(); location.href = "index.html"; };
});
