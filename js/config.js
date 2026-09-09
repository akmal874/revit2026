// ============================================================
//  KONFIGURASI SUPABASE
//  Ganti kedua nilai di bawah dengan kredensial project Anda.
//  Ambil di: Supabase Dashboard → Project Settings → API
// ============================================================
window.APP_CONFIG = {
  SUPABASE_URL:      "https://wuszglwufkpfkcjvgddv.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1c3pnbHd1ZmtwZmtjanZnZGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NDQxMTQsImV4cCI6MjEwNDUyMDExNH0.pL1vJpRz3cZMnJgZnBdRvZOqXv_TloMeEaW-x8jVqcI",
  BUCKET:            "bukti",     // nama Storage bucket
  // Batas kompresi gambar bukti
  COMPRESS_MAX_SIDE: 1280,        // px, sisi terpanjang
  COMPRESS_QUALITY:  0.7          // 0..1 (kualitas JPEG)
};
