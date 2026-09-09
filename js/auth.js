// ============================================================
//  AUTENTIKASI PENGELOLA
//  Publik bisa lihat tanpa login. Login membuka mode edit.
// ============================================================
let currentUser = null;

async function initAuth() {
  const { data } = await sb.auth.getSession();
  currentUser = data.session?.user || null;
  renderAuthState();

  sb.auth.onAuthStateChange((_e, session) => {
    currentUser = session?.user || null;
    renderAuthState();
    if (window.loadTransaksi) window.loadTransaksi();
  });
}

async function login(email, password) {
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

async function logout() {
  await sb.auth.signOut();
}

function isPengelola() { return !!currentUser; }

// Tampilkan / sembunyikan elemen bertanda edit-only
function renderAuthState() {
  const editing = isPengelola();
  document.querySelectorAll("[data-edit-only]").forEach((el) => {
    el.style.display = editing ? "" : "none";
  });
  const badge = document.getElementById("authBadge");
  const btnLogin = document.getElementById("btnLogin");
  const btnLogout = document.getElementById("btnLogout");
  if (editing) {
    badge.textContent = "Mode Pengelola";
    badge.classList.add("on");
    btnLogin.style.display = "none";
    btnLogout.style.display = "";
  } else {
    badge.textContent = "Tampilan Publik";
    badge.classList.remove("on");
    btnLogin.style.display = "";
    btnLogout.style.display = "none";
  }
}

window.initAuth = initAuth;
window.login = login;
window.logout = logout;
window.isPengelola = isPengelola;
