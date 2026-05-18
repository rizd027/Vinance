# Design Reference — Finance App UI/UX

> Referensi desain dari gambar mockup aplikasi keuangan mobile yang menjadi acuan pengembangan Keluarga Berkah Finance.

---

## 1. Gambaran Umum (Overview)

Mockup ini menampilkan **aplikasi keuangan personal berbasis mobile** dengan gaya desain modern, bersih, dan minimalis. Aplikasi menggunakan pendekatan **card-based UI** dengan skema warna dominan **biru gelap (navy/royal blue)** pada bagian atas dan **putih/abu-abu terang** pada bagian bawah, menciptakan kontras visual yang jelas antara area informasi utama dan area konten sekunder.

Ukuran layar yang ditampilkan mengacu pada **smartphone standar (±375×812 px / iPhone-like)** dengan status bar pukul **9:41** di bagian atas.

---

## 2. Struktur Layout

Layar dibagi menjadi **4 zona utama** secara vertikal:

```
┌─────────────────────────────────┐
│         STATUS BAR (OS)         │
├─────────────────────────────────┤
│   HEADER / BALANCE CARD (Biru)  │  ← Hero Section
│   Quick Action Buttons          │
├─────────────────────────────────┤
│   RECENT TRANSACTIONS (Putih)   │  ← Content Section
│   Filter Tabs + Transaction List│
├─────────────────────────────────┤
│      BOTTOM NAVIGATION BAR      │  ← Nav Section
└─────────────────────────────────┘
```

---

## 3. Header / Balance Card

### 3.1 Warna & Latar Belakang
- **Background**: Gradasi biru gelap (navy blue → royal blue), kemungkinan menggunakan `linear-gradient` dari kiri-atas ke kanan-bawah.
- **Border radius**: Pojok bawah kartu melengkung signifikan (≈ 24–32px), memberikan kesan "kartu mengambang" di atas konten putih di bawahnya.
- **Padding**: Horizontal ±20px, Vertikal ±24px.

### 3.2 Baris Pertama — Saldo Utama
- **Angka saldo**: `$2,589.50` — ditampilkan dengan tipografi **bold, besar (≈ 32–36px)**, warna **putih murni**.
- **Label**: `Available Balance` — teks kecil (≈ 12–13px), warna **putih transparan (opacity ±70%)**, diletakkan di bawah angka saldo.
- **Ikon notifikasi (lonceng)**: Berada di pojok kanan atas area header, ikon outline putih, ukuran ±22px.
- **Avatar pengguna**: Foto profil bulat (circle crop, diameter ±36px) berada di sebelah kanan ikon notifikasi. Memiliki **border putih tipis** sebagai separator.

### 3.3 Baris Kedua — Quick Action Buttons
Terdapat **4 tombol aksi cepat** yang tersusun horizontal dengan jarak yang merata (justify-evenly):

| Ikon | Label |
|------|-------|
| 📤 Send (panah keluar) | Send |
| 📥 Request (panah masuk) | Request |
| 💰 Loan (kantong uang) | Loan |
| 💳 Topup (dompet/kartu) | Topup |

**Spesifikasi tombol:**
- **Kontainer ikon**: Kotak persegi panjang dengan sudut membulat (rounded square), warna **putih transparan / semi-opaque** (seperti glassmorphism ringan).
- **Ikon**: Warna putih atau biru muda, ukuran ikon ±20–22px.
- **Label**: Teks kecil di bawah ikon, warna **putih**, ukuran ±11–12px.
- **Ukuran tombol**: Sekitar 56×56px untuk area kontainer ikon.
- **Efek visual**: Kemungkinan terdapat efek hover/press (ripple atau opacity change).

---

## 4. Konten Utama — Recent Transactions

### 4.1 Header Seksi
- **Judul**: `Recent Transactions` — teks **bold**, ukuran ±17–18px, warna **biru gelap/navy**.
- **Tautan**: `See all` — teks kecil ±13px, warna **biru terang/cobalt**, diletakkan rata kanan (align-right), berfungsi sebagai navigasi ke halaman riwayat lengkap.

### 4.2 Filter Tabs (Pill/Chip Style)
Tiga tab filter berbentuk **pill (rounded-full)** tersusun horizontal di bawah judul seksi:

| Tab | Status Visual |
|-----|---------------|
| **All** | Aktif — background biru gelap, teks putih |
| **Income** | Tidak aktif — outline/border tipis, teks abu-abu gelap, terdapat **dot hijau** di sebelah kiri teks |
| **Expense** | Tidak aktif — outline/border tipis, teks abu-abu gelap, terdapat **dot merah/oranye** di sebelah kiri teks |

**Detail tab aktif:**
- Background: biru navy (`#1a2c5b` atau serupa)
- Teks: putih bold
- Border-radius: ±20px (pill penuh)

**Detail tab tidak aktif:**
- Background: transparan atau putih
- Border: 1px solid abu-abu terang
- Dot warna: hijau (#4CAF50-ish) untuk Income, oranye/merah (#FF6B6B-ish) untuk Expense

### 4.3 Daftar Transaksi

Transaksi dikelompokkan berdasarkan **label tanggal** (waktu relatif):

---

#### Kelompok: TODAY
**Separator label**: Teks `TODAY`, ukuran ±11px, warna abu-abu terang (`#999` atau serupa), huruf kapital semua (uppercase), berfungsi sebagai pemisah waktu.

---

**Transaksi 1 — Grocery**
- **Ikon**: Ilustrasi belanja (keranjang belanja / tas belanja), warna biru muda, dalam lingkaran abu-abu terang sebagai background.
- **Nama transaksi**: `Grocery` — bold, ±15px, warna hitam/navy gelap.
- **Sub-label**: `Eataly downtown` — regular, ±12px, warna abu-abu.
- **Jumlah**: `- $50.68` — bold, ±15px, warna **merah** (menandakan pengeluaran).
- **Tanggal**: `Aug 26` — regular, ±12px, warna abu-abu, rata kanan.
- **Layout**: Ikon di kiri | Nama+sub di tengah (flex-grow) | Jumlah+tanggal di kanan (column).

---

**Transaksi 2 — Transport**
- **Ikon**: Ilustrasi mobil/kendaraan, warna biru muda, dalam lingkaran abu-abu terang.
- **Nama transaksi**: `Transport` — bold, ±15px.
- **Sub-label**: `UBER Pool` — regular, ±12px, abu-abu.
- **Jumlah**: `- $6.00` — bold, ±15px, warna **merah**.
- **Tanggal**: `Aug 26` — regular, ±12px, abu-abu.

---

#### Kelompok: YESTERDAY
**Separator label**: Teks `YESTERDAY`, sama styling dengan `TODAY`.

---

**Transaksi 3 — Payment**
- **Ikon**: Ilustrasi pembayaran (kartu/tanda terima), warna biru muda, lingkaran abu-abu.
- **Nama transaksi**: `Payment` — bold, ±15px.
- **Sub-label**: `Payment from Andre` — regular, ±12px, abu-abu.
- **Jumlah**: `+ $650.00` — bold, ±15px, warna **hijau** (menandakan pemasukan).
- **Tanggal**: `Aug 25` — regular, ±12px, abu-abu.

---

### 4.4 Spacing & Divider Antar Transaksi
- Setiap item transaksi memiliki **padding vertikal ±14–16px**.
- **Tidak ada garis pemisah (divider line)** yang terlihat antar item — pemisahan dilakukan murni via whitespace (padding).
- Latar belakang seluruh area konten: **putih bersih** (`#FFFFFF`).

---

## 5. Bottom Navigation Bar

### 5.1 Struktur Tab
Terdapat **5 item navigasi** yang tersusun horizontal merata:

| Urutan | Ikon | Label | Status |
|--------|------|-------|--------|
| 1 | 🏠 Home | Home | **Aktif** |
| 2 | 📋 History | History | Tidak aktif |
| 3 | ➕ Plus (FAB) | *(tidak ada label)* | Tombol aksi utama |
| 4 | 💳 Cards | Cards | Tidak aktif |
| 5 | 👤 Profile | Profile | Tidak aktif |

### 5.2 Spesifikasi Visual

**Tab Aktif (Home):**
- Ikon: warna **biru gelap/navy**
- Label: warna biru gelap, bold
- Indikator: tidak ada underline — pembeda hanya warna

**Tab Tidak Aktif:**
- Ikon: warna **abu-abu terang** (`#BBBBBB` atau serupa)
- Label: abu-abu, regular weight

**Tombol FAB (Floating Action Button) Tengah:**
- Berbentuk **lingkaran penuh**, diameter ±52–56px
- Warna: **biru gelap/navy** (konsisten dengan tema utama)
- Ikon: **"+"** putih, besar (±24px)
- **Elevasi**: Tombol ini **menonjol ke atas** melampaui batas bottom bar (translateY negatif ±-16px), menciptakan efek FAB klasik
- Shadow: `box-shadow` signifikan untuk memberi kesan mengambang

### 5.3 Background & Border Nav Bar
- Background: **putih** atau abu-abu sangat terang
- Border-top: 1px solid abu-abu terang, ATAU tidak ada border dengan efek shadow tipis di atas

---

## 6. Tipografi

| Elemen | Ukuran | Weight | Warna |
|--------|--------|--------|-------|
| Saldo utama | 32–36px | Bold (700) | Putih |
| Label saldo | 12–13px | Regular (400) | Putih 70% |
| Judul seksi | 17–18px | SemiBold (600) | Navy |
| Nama transaksi | 14–15px | SemiBold (600) | Hitam/Navy |
| Sub-label transaksi | 12px | Regular (400) | Abu-abu |
| Jumlah transaksi | 14–15px | Bold (700) | Merah / Hijau |
| Tanggal transaksi | 12px | Regular (400) | Abu-abu |
| Label group waktu | 11px | Medium (500) | Abu-abu terang |
| Label tab navigasi | 11–12px | Regular/Medium | Biru / Abu-abu |
| Label quick action | 11–12px | Regular | Putih |

**Font yang direkomendasikan**: `Inter`, `Poppins`, atau `SF Pro` (system font iOS) — keduanya cocok dengan estetika bersih dan modern ini.

---

## 7. Palet Warna

| Nama | Hex (estimasi) | Penggunaan |
|------|---------------|------------|
| Navy Primary | `#1A2C5B` | Header BG, FAB, teks aktif |
| Royal Blue | `#2D4DB5` | Gradasi header |
| Income Green | `#2ECC71` | Jumlah pemasukan, dot Income |
| Expense Red | `#E74C3C` | Jumlah pengeluaran |
| Expense Orange | `#FF6B6B` | Dot Expense tab |
| White | `#FFFFFF` | Background konten, teks header |
| Light Gray BG | `#F5F6FA` | Background ikon transaksi |
| Gray Text | `#9AA5B4` | Sub-label, tanggal, nav tidak aktif |
| Dark Text | `#1E2D40` | Nama transaksi, judul seksi |

---

## 8. Analisis UX (User Experience)

### 8.1 Hierarki Visual
- Informasi yang **paling penting** (saldo tersedia) ditempatkan di posisi paling atas dan paling besar secara visual → memenuhi prinsip **F-pattern reading** dan **visual hierarchy**.
- Aksi cepat (Send, Request, Loan, Topup) ditempatkan **langsung di bawah saldo** → meminimalkan langkah pengguna untuk fungsi inti.
- Transaksi terbaru ditampilkan tanpa perlu navigasi → mendukung prinsip **zero-click information**.

### 8.2 Navigasi
- **Bottom navigation** adalah standar de facto mobile finance app — familiar dan mudah dijangkau jempol.
- **FAB "+"** di tengah nav bar adalah titik aksi primer yang sangat menonjol, mendorong pengguna untuk menambah transaksi dengan satu kali tap.
- `See all` link di sebelah "Recent Transactions" memberikan jalan masuk cepat ke histori lengkap tanpa mengorbankan ruang layar.

### 8.3 Keterbacaan & Aksesibilitas
- **Kontras warna** antara teks putih dan latar biru gelap di header sudah sangat baik (rasio kontras > 4.5:1).
- Penggunaan **warna merah untuk expense** dan **hijau untuk income** adalah pola universal yang intuitif dan dikenal pengguna.
- Ukuran tap target tombol navigasi dan quick action sudah memenuhi standar minimum **44×44px** (Apple HIG).

### 8.4 Konsistensi Desain
- Ikon transaksi menggunakan **gaya ilustrasi yang konsisten** (warna biru muda, background lingkaran abu-abu).
- Spacing antar elemen konsisten dan rapi — tidak ada elemen yang terasa "berhimpit".
- Penggunaan **rounded corner** secara konsisten di seluruh elemen (kartu, tombol, tab, ikon) menciptakan bahasa desain yang kohesif.

### 8.5 Feedback Visual
- Tab filter aktif memiliki background berbeda — pengguna langsung tahu filter mana yang aktif.
- Warna jumlah transaksi (merah/hijau) memberikan **feedback instan** tanpa perlu membaca simbol +/-.
- Avatar profil di header memberikan **personalisasi** dan konfirmasi identitas pengguna.

---

## 9. Rekomendasi Implementasi untuk Keluarga Berkah Finance

1. **Gunakan komponen Card** dengan border-radius ≥ 20px untuk hero section saldo.
2. **Implementasikan gradient biru** pada header: `linear-gradient(135deg, #1A2C5B 0%, #2D4DB5 100%)`.
3. **Filter tab** menggunakan `display: flex` dengan `gap` merata, state aktif menggunakan class toggle.
4. **Daftar transaksi** gunakan `<ul>/<li>` semantik dengan grouping per tanggal menggunakan `<section>` atau label sticky.
5. **FAB** gunakan `position: fixed` dengan `z-index` tinggi dan `transform: translateY(-50%)` relatif terhadap navbar.
6. **Warna income/expense** harus diterapkan secara programatik berdasarkan tanda nilai (positif/negatif).
7. **Tipografi**: Impor `Inter` atau `Poppins` dari Google Fonts untuk mendekati estetika desain referensi.

---

*Dokumen ini dibuat berdasarkan analisis visual mockup UI aplikasi keuangan mobile yang dijadikan referensi desain untuk proyek Keluarga Berkah Finance v1.2.*
