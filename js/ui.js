// ============================================================
//  UI: render ringkasan, tabel, modal
// ============================================================
const rp = (n) => "Rp " + (n || 0).toLocaleString("id-ID");
// "Rp" dan nominal dipisah agar bisa dibuat rata kiri-kanan saat cetak
const rpSplit = (n) => `<span class="rp-sym">Rp</span><span class="rp-num">${(n||0).toLocaleString("id-ID")}</span>`;
const initials = (name="") => name.trim().split(/\s+/).slice(0,2).map(w=>w[0]||"").join("").toUpperCase();
const fmtTgl = (d) => {
  const dt = new Date(d + "T00:00:00");
  const bulan = dt.toLocaleDateString("id-ID",{month:"short"});
  return {
    hari: dt.toLocaleDateString("id-ID",{day:"2-digit",month:"short"}),
    thn: dt.getFullYear(),
    // format cetak: 07-Sep-26
    cetak: `${String(dt.getDate()).padStart(2,"0")}-${bulan}-${String(dt.getFullYear()).slice(-2)}`
  };
};
const pajakTag = (p) => (p==="tanpa" || !p)
  ? '<span class="tag tag-np">Tanpa Pajak</span>'
  : `<span class="tag tag-tax">${window.pajakLabel(p)}</span>`;

let STATE = { pengaturan:null, rows:[], bulan:"all", cari:"", page:1, perPage:10 };

async function loadTransaksi() {
  STATE.pengaturan = await getPengaturan();
  const raw = await fetchTransaksi(STATE.bulan);
  const R = hitungRingkasan(raw, STATE.pengaturan.pagu_anggaran);
  STATE.rows = R.rows;
  STATE.page = 1;
  renderSummary(R, STATE.pengaturan);
  renderTable();
}
window.loadTransaksi = loadTransaksi;

function applyFilter(rows){
  const q = STATE.cari.toLowerCase().trim();
  if(!q) return rows;
  return rows.filter(r =>
    (r.uraian||"").toLowerCase().includes(q) ||
    (r.nama_toko||"").toLowerCase().includes(q) ||
    (r.penanggung_jawab||"").toLowerCase().includes(q) ||
    (r.keterangan||"").toLowerCase().includes(q));
}

function renderSummary(R, p){
  document.getElementById("sekolahName").textContent =
    `Tahun Anggaran ${p.tahun} · ${p.nama_sekolah} · Pembukuan Kas Transparan`;
  document.getElementById("vPagu").textContent = rp(p.pagu_anggaran);
  document.getElementById("vMasuk").textContent = rp(R.masuk);
  document.getElementById("vKeluar").textContent = rp(R.keluar);
  document.getElementById("vSaldo").textContent = rp(R.saldoAkhir);
  document.getElementById("vBank").textContent = rp(R.sisaBank);
  document.getElementById("vPajak").textContent = rp(R.pajak);
  document.getElementById("vJumlah").textContent = R.jumlah;
  const pct = Math.min(R.serapan,100);
  document.getElementById("progBar").style.width = pct + "%";
  document.getElementById("progLbl").innerHTML =
    `Terserap ${pct.toFixed(1)}% · <span class="num">${rp(R.keluar)}</span> dari pagu`;
}

function renderTable(printAll=false){
  const filtered = applyFilter(STATE.rows);
  const total = STATE.rows.length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / STATE.perPage));
  if(STATE.page > totalPages) STATE.page = totalPages;
  const start = printAll ? 0 : (STATE.page - 1) * STATE.perPage;
  const pageRows = printAll ? filtered : filtered.slice(start, start + STATE.perPage);

  const tb = document.getElementById("tbody");
  if(!filtered.length){
    tb.innerHTML = `<tr><td colspan="12" class="empty">Belum ada transaksi. ${isPengelola()?"Klik <b>Tambah Transaksi</b> untuk mulai mencatat.":""}</td></tr>`;
  } else {
    tb.innerHTML = pageRows.map((r,idx)=>{
      const no = start + idx + 1;
      const t = fmtTgl(r.tanggal);
      const bukti = r.bukti_url
        ? `<a class="proof-link" href="javascript:void(0)" onclick="showImg('${r.bukti_url}')">Lihat bukti</a>`
        : `<span class="dash">—</span>`;
      const aksi = isPengelola()
        ? `<div class="act"><button class="ibtn edit" onclick='openEdit(${JSON.stringify(JSON.stringify(r))})'>Ubah</button>
           <button class="ibtn del" onclick="hapus('${r.id}')">Hapus</button></div>`
        : `<span class="dash">—</span>`;
      return `<tr>
        <td class="num" data-label="No">${no}</td>
        <td class="date" data-label="Tanggal"><span class="tgl-layar">${t.hari} ${t.thn}</span><span class="tgl-cetak">${t.cetak}</span></td>
        <td class="desc" data-label="Uraian">${r.uraian}</td>
        <td data-label="Pemasukan" class="${r.jenis==='masuk'?'amt-in num':'dash'}">${r.jenis==='masuk'?rpSplit(r.nominal):'—'}</td>
        <td data-label="Pengeluaran" class="${r.jenis==='keluar'?'amt-out num':'dash'}">${r.jenis==='keluar'?rpSplit(r.nominal):'—'}</td>
        <td class="amt-bal num" data-label="Saldo">${rpSplit(r.saldoBerjalan)}</td>
        <td data-label="Pajak">${pajakTag(r.pajak)}</td>
        <td data-label="Nama Toko">${r.nama_toko||"—"}</td>
        <td data-label="Penanggung Jawab"><div class="pj"><span class="ava">${initials(r.penanggung_jawab)}</span>${r.penanggung_jawab}</div></td>
        <td class="ket" data-label="Keterangan">${r.keterangan||"—"}</td>
        <td data-label="Bukti">${bukti}</td>
        <td data-label="Aksi">${aksi}</td>
      </tr>`;
    }).join("");
  }

  // info + pagination
  const from = filtered.length ? start + 1 : 0;
  const to = Math.min(start + STATE.perPage, filtered.length);
  document.getElementById("footInfo").textContent =
    `Menampilkan ${from}–${to} dari ${filtered.length} transaksi` +
    (filtered.length !== total ? ` (difilter dari ${total})` : "");
  renderPagination(totalPages);
}

function renderPagination(totalPages){
  const el = document.getElementById("pagination");
  if(!el) return;
  if(totalPages <= 1){ el.innerHTML = ""; return; }
  const p = STATE.page;
  const btn = (label, target, disabled=false, active=false) =>
    `<button class="pg-btn${active?" active":""}" ${disabled?"disabled":""} onclick="gotoPage(${target})">${label}</button>`;

  // buat rentang nomor halaman ringkas
  let nums = [];
  const win = 1;
  for(let i=1;i<=totalPages;i++){
    if(i===1 || i===totalPages || (i>=p-win && i<=p+win)) nums.push(i);
    else if(nums[nums.length-1] !== "…") nums.push("…");
  }
  const numsHtml = nums.map(n => n==="…" ? `<span class="pg-dots">…</span>` : btn(n, n, false, n===p)).join("");

  el.innerHTML =
    btn("‹ Sebelumnya", p-1, p===1) + numsHtml + btn("Berikutnya ›", p+1, p===totalPages);
}

function gotoPage(n){ STATE.page = n; renderTable(); window.scrollTo({top:document.querySelector('.table-wrap').offsetTop-20,behavior:'smooth'}); }
window.gotoPage = gotoPage;


// ---- Modal Transaksi ----
function openAdd(){ openModal(); }
function openEdit(jsonStr){ openModal(JSON.parse(jsonStr)); }

// isi dropdown dari data master
function isiDropdown(){
  const opt = (v,l)=>`<option value="${v}">${l}</option>`;
  const pj = document.querySelector('#formTx [name=penanggung_jawab]');
  pj.innerHTML = `<option value="">— pilih —</option>` +
    window.MASTER.penanggungJawab.map(n=>opt(n,n)).join("");
  const tk = document.querySelector('#formTx [name=nama_toko]');
  tk.innerHTML = `<option value="">— pilih toko —</option>` +
    window.MASTER.toko.map(n=>opt(n,n)).join("") +
    `<option value="__lain">+ Toko lain…</option>`;
  const px = document.querySelector('#formTx [name=pajak]');
  px.innerHTML = window.MASTER.pajak.map(p=>opt(p.value,p.label)).join("");
}

function openModal(data=null){
  isiDropdown();
  document.getElementById("mTitle").textContent = data ? "Ubah Transaksi" : "Tambah Transaksi";
  const f = document.getElementById("formTx");
  f.reset();
  document.getElementById("tokoLainWrap").style.display = "none";
  f.dataset.id = data?.id || "";
  if(data){
    f.tanggal.value = data.tanggal;
    f.uraian.value = data.uraian;
    f.jenis.value = data.jenis;
    f.nominal.value = data.nominal;
    f.pajak.value = data.pajak || "tanpa";
    f.pajak_nominal.value = data.pajak_nominal || 0;
    // toko: jika tidak ada di daftar, pakai "toko lain"
    if(data.nama_toko && !window.MASTER.toko.includes(data.nama_toko)){
      f.nama_toko.value = "__lain";
      document.getElementById("tokoLainWrap").style.display = "";
      f.nama_toko_lain.value = data.nama_toko;
    } else {
      f.nama_toko.value = data.nama_toko || "";
    }
    f.penanggung_jawab.value = data.penanggung_jawab;
    f.keterangan.value = data.keterangan || "";
  }
  document.getElementById("compressInfo").textContent = "";
  document.getElementById("overlay").classList.remove("hidden");
}
function closeModal(){ document.getElementById("overlay").classList.add("hidden"); }

async function submitTx(e){
  e.preventDefault();
  const f = e.target;
  const btn = document.getElementById("btnSimpan");
  btn.disabled = true; btn.textContent = "Menyimpan…";
  try{
    let bukti_url = null;
    const file = f.bukti.files[0];
    if(file){
      btn.textContent = "Mengompres & mengunggah…";
      const up = await uploadBukti(file);
      bukti_url = up.url;
    }
    const payload = {
      tanggal: f.tanggal.value,
      uraian: f.uraian.value,
      jenis: f.jenis.value,
      nominal: parseInt(f.nominal.value,10),
      pajak: f.pajak.value,
      pajak_nominal: parseInt(f.pajak_nominal.value||0,10),
      nama_toko: (f.nama_toko.value === "__lain" ? (f.nama_toko_lain.value || null) : (f.nama_toko.value || null)),
      penanggung_jawab: f.penanggung_jawab.value,
      keterangan: f.keterangan.value || null
    };
    if(bukti_url) payload.bukti_url = bukti_url;

    if(f.dataset.id) await updateTransaksi(f.dataset.id, payload);
    else await addTransaksi(payload);

    closeModal();
    await loadTransaksi();
  }catch(err){ alert("Gagal menyimpan: " + err.message); }
  finally{ btn.disabled=false; btn.textContent="Simpan"; }
}

async function hapus(id){
  if(!confirm("Hapus transaksi ini? Tindakan tidak bisa dibatalkan.")) return;
  try{ await deleteTransaksi(id); await loadTransaksi(); }
  catch(err){ alert("Gagal menghapus: "+err.message); }
}

// preview kompres saat pilih file
async function onPickFile(e){
  const file = e.target.files[0];
  const el = document.getElementById("compressInfo");
  if(!file){ el.textContent=""; return; }
  el.textContent = "Mengompres…";
  const { blob } = await compressImage(file);
  el.textContent = `Ukuran: ${humanSize(file.size)} → ${humanSize(blob.size)} (hemat ${Math.round((1-blob.size/file.size)*100)}%)`;
}

// ---- Pagu ----
async function ubahPagu(){
  const cur = STATE.pengaturan?.pagu_anggaran || 0;
  const val = prompt("Masukkan Pagu Anggaran (angka saja):", cur);
  if(val===null) return;
  const n = parseInt(val.replace(/\D/g,""),10);
  if(isNaN(n)) return alert("Angka tidak valid.");
  try{ await setPagu(n); await loadTransaksi(); }
  catch(err){ alert("Gagal: "+err.message); }
}

// ---- Lightbox ----
function showImg(url){
  const lb=document.createElement("div");
  lb.className="lightbox"; lb.onclick=()=>lb.remove();
  lb.innerHTML=`<img src="${url}">`;
  document.body.appendChild(lb);
}

// ---- Login modal ----
async function doLogin(e){
  e.preventDefault();
  const f=e.target;
  try{ await login(f.email.value, f.password.value); document.getElementById("loginOverlay").classList.add("hidden"); }
  catch(err){ document.getElementById("loginErr").textContent = "Login gagal: "+err.message; }
}

// toggle input "toko lain"
function onTokoChange(e){
  document.getElementById("tokoLainWrap").style.display = e.target.value==="__lain" ? "" : "none";
}

Object.assign(window,{openAdd,openEdit,closeModal,submitTx,hapus,onPickFile,ubahPagu,showImg,doLogin,onTokoChange});

// ---- Bind toolbar ----
window.addEventListener("DOMContentLoaded", async ()=>{
  document.getElementById("selBulan").onchange = (e)=>{ STATE.bulan=e.target.value; loadTransaksi(); };
  document.getElementById("inpCari").oninput = (e)=>{ STATE.cari=e.target.value; STATE.page=1; renderTable(); };
  document.getElementById("btnExcel").onclick = ()=>exportExcel(applyFilter(STATE.rows), hitungRingkasan(STATE.rows,STATE.pengaturan.pagu_anggaran), {nama_sekolah:STATE.pengaturan.nama_sekolah, pagu:STATE.pengaturan.pagu_anggaran});
  document.getElementById("btnCetak").onclick = cetakLaporan;
  document.getElementById("btnLogin").onclick = ()=>document.getElementById("loginOverlay").classList.remove("hidden");
  document.getElementById("btnLogout").onclick = logout;

  await initAuth();

  if (window.SUPABASE_SIAP === false) {
    const tb = document.getElementById("tbody");
    if (tb) tb.innerHTML =
      `<tr><td colspan="12" class="empty">
        <b>Supabase belum dikonfigurasi.</b><br>
        Buka file <code>js/config.js</code> lalu isi <code>SUPABASE_URL</code> dan
        <code>SUPABASE_ANON_KEY</code> sesuai project Anda.<br>
        Lihat panduan di file <b>PANDUAN-INSTALASI.md</b>.
      </td></tr>`;
    document.getElementById("sekolahName").textContent =
      "Konfigurasi diperlukan — lihat PANDUAN-INSTALASI.md";
    return;
  }

  try {
    await loadTransaksi();
  } catch (err) {
    const tb = document.getElementById("tbody");
    if (tb) tb.innerHTML =
      `<tr><td colspan="12" class="empty">Gagal memuat data: ${err.message}.<br>
       Periksa kredensial di <code>js/config.js</code> dan pastikan tabel Supabase sudah dibuat (jalankan <code>sql/setup.sql</code>).</td></tr>`;
    console.error(err);
  }
});
