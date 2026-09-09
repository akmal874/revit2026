// ============================================================
//  DATA MASTER (untuk dropdown form)
//  Edit daftar di sini untuk menambah/mengubah pilihan.
// ============================================================
window.MASTER = {
  // Penanggung jawab
  penanggungJawab: [
    "Drs. H. Muhammad Nur, M.M.",
    "Akmal Iskandar, S.Pi",
    "Edwar Agus, S.Pd",
    "Zul Fikar, S.Pd",
    "Muhadir, S.Pi",
    "Syahrul Raja, S.Pd",
  ],

  // Daftar toko (bisa ditambah lewat form dengan opsi "+ Toko lain…")
  toko: [
    "Toko Kawan Baru",
    "Sinar Cat",
    "CV Sewa Alat",
    "Toko Besi Makmur",
    "Toko Listrik Terang",
  ],

  // Jenis pajak: value dipakai sistem, label ditampilkan
  pajak: [
    { value: "tanpa", label: "Tanpa Pajak" },
    { value: "ppn11", label: "PPN 11%" },
    { value: "pph21_5", label: "PPh 21 5%" },
    { value: "pph21_6", label: "PPh 21 6%" },
    { value: "pph22", label: "PPh 22" },
    { value: "pph23", label: "PPh 23" },
    { value: "pph4", label: "PPh 4" },
  ],
};

// label pajak untuk ditampilkan di tabel
window.pajakLabel = (v) => {
  const f = window.MASTER.pajak.find((p) => p.value === v);
  return f ? f.label : "Tanpa Pajak";
};
