// ============================================================
//  CRUD TRANSAKSI + PENGATURAN + UPLOAD BUKTI
// ============================================================

// --- Pengaturan (pagu) ---
async function getPengaturan() {
  const { data, error } = await sb.from("pengaturan").select("*").eq("id", 1).single();
  if (error) throw error;
  return data;
}
async function setPagu(nilai) {
  const { error } = await sb.from("pengaturan")
    .update({ pagu_anggaran: nilai, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw error;
}

// --- Transaksi ---
async function fetchTransaksi(bulan = "all") {
  let q = sb.from("transaksi").select("*").order("tanggal", { ascending: true })
                                          .order("created_at", { ascending: true });
  if (bulan !== "all") {
    const [y, m] = bulan.split("-");
    const start = `${y}-${m}-01`;
    const end = new Date(y, m, 0).toISOString().slice(0, 10); // akhir bulan
    q = q.gte("tanggal", start).lte("tanggal", end);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

async function addTransaksi(t) {
  const { error } = await sb.from("transaksi").insert(t);
  if (error) throw error;
}
async function updateTransaksi(id, t) {
  const { error } = await sb.from("transaksi").update(t).eq("id", id);
  if (error) throw error;
}
async function deleteTransaksi(id) {
  const { error } = await sb.from("transaksi").delete().eq("id", id);
  if (error) throw error;
}

// --- Upload bukti (dikompres dulu) ---
async function uploadBukti(file) {
  if (!file) return null;
  const { blob, ext } = await compressImage(file);
  const name = `${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage
    .from(window.APP_CONFIG.BUCKET)
    .upload(name, blob, { contentType: blob.type || "image/jpeg", upsert: false });
  if (error) throw error;
  const { data } = sb.storage.from(window.APP_CONFIG.BUCKET).getPublicUrl(name);
  return { url: data.publicUrl, size: blob.size, original: file.size };
}

// --- Hitung saldo berjalan + ringkasan ---
function hitungRingkasan(rows, pagu) {
  let masuk = 0, keluar = 0, pajak = 0, saldo = 0;
  const withSaldo = rows.map((r) => {
    if (r.jenis === "masuk") { masuk += r.nominal; saldo += r.nominal; }
    else { keluar += r.nominal; saldo -= r.nominal; }
    pajak += r.pajak_nominal || 0;
    return { ...r, saldoBerjalan: saldo };
  });
  return {
    rows: withSaldo,
    masuk, keluar, pajak,
    saldoAkhir: masuk - keluar,
    sisaBank: pagu - masuk,        // sisa dana di bank = pagu - pemasukan (penarikan)
    kasBendahara: masuk - keluar,  // saldo kas bendahara = saldo akhir transaksi
    serapan: pagu ? (keluar / pagu) * 100 : 0,
    jumlah: rows.length
  };
}

Object.assign(window, {
  getPengaturan, setPagu, fetchTransaksi, addTransaksi,
  updateTransaksi, deleteTransaksi, uploadBukti, hitungRingkasan
});
