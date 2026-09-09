// ============================================================
//  KOMPRES GAMBAR BUKTI
//  Resize sisi terpanjang ke COMPRESS_MAX_SIDE, re-encode JPEG.
//  Mengembalikan Blob yang jauh lebih kecil dari file asli.
// ============================================================
async function compressImage(file) {
  const cfg = window.APP_CONFIG;

  // Kalau bukan gambar, kembalikan apa adanya
  if (!file.type.startsWith("image/")) return { blob: file, ext: "bin" };

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  const max = cfg.COMPRESS_MAX_SIDE;

  if (width > max || height > max) {
    const ratio = Math.min(max / width, max / height);
    width  = Math.round(width  * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";               // hilangkan transparansi PNG
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise((res) =>
    canvas.toBlob(res, "image/jpeg", cfg.COMPRESS_QUALITY)
  );

  return { blob, ext: "jpg" };
}

// Info hemat ukuran (untuk ditampilkan ke pengguna)
function humanSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

window.compressImage = compressImage;
window.humanSize = humanSize;
