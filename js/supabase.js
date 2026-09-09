// Inisialisasi client Supabase (memakai UMD bundle dari CDN di index.html)
const { createClient } = supabase;

// Cek apakah kredensial sudah diisi
const _url = window.APP_CONFIG.SUPABASE_URL || "";
const _key = window.APP_CONFIG.SUPABASE_ANON_KEY || "";
window.SUPABASE_SIAP = !_url.includes("GANTI") && !_key.includes("GANTI") && _url.startsWith("http");

const sb = createClient(_url || "https://placeholder.supabase.co", _key || "placeholder");
window.sb = sb;

if (!window.SUPABASE_SIAP) {
  console.warn("Supabase belum dikonfigurasi. Isi js/config.js dengan URL & anon key Anda.");
}

