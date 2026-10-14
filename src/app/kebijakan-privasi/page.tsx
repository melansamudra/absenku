import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — HrCash",
  description: "Kebijakan privasi dan pengelolaan data pribadi di layanan HrCash.",
};

const EFFECTIVE_DATE = "13 Oktober 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-zinc-600">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm font-medium text-brand-600 hover:underline">
        ← Kembali
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">Kebijakan Privasi</h1>
      <p className="mt-1 text-sm text-zinc-400">Berlaku sejak {EFFECTIVE_DATE}</p>

      <p className="mt-6 text-sm leading-relaxed text-zinc-600">
        Kebijakan ini menjelaskan bagaimana Cashimpact (&ldquo;Kami&rdquo;) mengumpulkan, menggunakan, dan
        melindungi data pribadi yang diproses lewat HrCash (&ldquo;Layanan&rdquo;), sesuai dengan Undang-Undang
        No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
      </p>

      <Section title="1. Data yang Kami Kumpulkan">
        <p className="font-medium text-zinc-800">Data pemilik/admin bisnis (Pengguna terdaftar):</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Email, nomor telepon/WhatsApp, password (tersimpan dalam bentuk terenkripsi).</li>
          <li>Nama bisnis, alamat, dan data pengaturan bisnis.</li>
        </ul>
        <p className="mt-3 font-medium text-zinc-800">Data karyawan (dimasukkan oleh Pengguna):</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Data identitas: nama, NIK, tanggal lahir, alamat.</li>
          <li>Data kepegawaian: jabatan, gaji, rekening bank, status PTKP, nomor BPJS.</li>
          <li>
            Data kehadiran: foto selfie saat absen, lokasi GPS saat absen (jika fitur geofence
            aktif), waktu check-in/check-out.
          </li>
          <li>PIN absen (tersimpan dalam bentuk ter-hash, tidak bisa dibaca kembali oleh siapa pun termasuk Kami).</li>
        </ul>
      </Section>

      <Section title="2. Tujuan Penggunaan Data">
        <ul className="list-disc space-y-1 pl-5">
          <li>Menjalankan fungsi inti Layanan: pencatatan absensi, perhitungan payroll, manajemen cuti/lembur/reimbursement.</li>
          <li>Verifikasi identitas saat absen selfie.</li>
          <li>Komunikasi terkait akun (aktivasi, notifikasi email, konfirmasi pembayaran).</li>
          <li>Keamanan sistem (mencegah penyalahgunaan/spam pada formulir publik).</li>
        </ul>
        <p>
          Kami <span className="font-medium text-zinc-800">tidak menjual</span> data pribadi
          Pengguna atau karyawan kepada pihak ketiga untuk tujuan pemasaran.
        </p>
      </Section>

      <Section title="3. Pihak Ketiga yang Memproses Data">
        <p>Data disimpan dan diproses lewat penyedia infrastruktur berikut, sebagai pemroses data atas nama Kami:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><span className="font-medium text-zinc-800">Supabase</span> — database, autentikasi, dan penyimpanan foto.</li>
          <li><span className="font-medium text-zinc-800">Vercel</span> — hosting aplikasi.</li>
          <li><span className="font-medium text-zinc-800">Resend</span> — pengiriman email notifikasi (opsional, kalau diaktifkan).</li>
        </ul>
      </Section>

      <Section title="4. Keamanan Data">
        <ul className="list-disc space-y-1 pl-5">
          <li>Setiap bisnis hanya bisa mengakses datanya sendiri (isolasi data antar-bisnis di tingkat database).</li>
          <li>PIN absen karyawan disimpan dalam bentuk hash satu arah, bukan teks biasa.</li>
          <li>Foto selfie absensi disimpan di penyimpanan privat, tidak bisa diakses publik tanpa otorisasi.</li>
          <li>Foto selfie dihapus permanen segera setelah presensi disetujui admin. Foto yang belum disetujui dihapus otomatis paling lambat 30 hari setelah tanggal absen. Data jam, lokasi, dan status absensi tetap tersimpan.</li>
          <li>Koneksi ke Layanan terenkripsi (HTTPS).</li>
        </ul>
      </Section>

      <Section title="5. Hak Subjek Data">
        <p>Sesuai UU PDP, Pengguna dan karyawan (lewat Pengguna sebagai pengendali data bisnis) berhak untuk:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Mengakses dan memperbaiki data pribadi yang tersimpan.</li>
          <li>Meminta penghapusan data (mis. saat karyawan berhenti bekerja, atau akun ditutup).</li>
          <li>Menarik persetujuan pemrosesan data, dengan konsekuensi Layanan mungkin tidak bisa digunakan sepenuhnya.</li>
        </ul>
        <p>
          Pemilik bisnis bertanggung jawab sebagai pengendali data (data controller) atas data
          karyawannya sendiri yang dimasukkan ke Layanan, termasuk memastikan persetujuan karyawan
          telah diperoleh sebelum data mereka dimasukkan.
        </p>
      </Section>

      <Section title="6. Retensi Data">
        <p>
          Data disimpan selama akun aktif digunakan. Setelah akun ditutup, Kami dapat menyimpan
          data untuk jangka waktu tertentu sesuai kewajiban hukum (mis. arsip pajak/ketenagakerjaan),
          sebelum dihapus secara permanen.
        </p>
      </Section>

      <Section title="7. Perubahan Kebijakan">
        <p>
          Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan material akan
          diinformasikan lewat email atau pemberitahuan di aplikasi.
        </p>
      </Section>

      <Section title="8. Kontak">
        <p>
          Pertanyaan atau permintaan terkait data pribadi Anda bisa dikirim lewat kontak yang
          tertera di aplikasi.
        </p>
      </Section>
    </div>
  );
}
