import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — HrCash",
  description: "Syarat dan ketentuan penggunaan layanan HrCash.",
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

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm font-medium text-brand-600 hover:underline">
        ← Kembali
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">Syarat & Ketentuan</h1>
      <p className="mt-1 text-sm text-zinc-400">Berlaku sejak {EFFECTIVE_DATE}</p>

      <Section title="1. Tentang Layanan">
        <p>
          HrCash (&ldquo;Layanan&rdquo;) adalah aplikasi berbasis web untuk absensi, data karyawan, dan payroll,
          disediakan oleh Cashimpact (&ldquo;Kami&rdquo;), bagian dari Createimpact.id. Dengan mendaftar dan
          menggunakan Layanan, Anda (&ldquo;Pengguna&rdquo;) setuju terikat pada Syarat & Ketentuan ini.
        </p>
      </Section>

      <Section title="2. Pendaftaran Akun & Aktivasi">
        <p>
          Pendaftaran akun memerlukan email dan nomor telepon yang aktif dan benar. Nomor telepon
          dipakai untuk konfirmasi aktivasi akun dan komunikasi terkait pembayaran.
        </p>
        <p>
          Akun bisnis baru berstatus <span className="font-medium text-zinc-800">belum aktif</span>{" "}
          sampai pembayaran dikonfirmasi dan diverifikasi secara manual oleh Kami. Selama belum
          aktif, akses ke fitur Layanan dikunci.
        </p>
      </Section>

      <Section title="3. Model Pembelian">
        <p>
          Layanan ini dijual dengan skema <span className="font-medium text-zinc-800">pembelian sekali bayar</span>{" "}
          (bukan langganan berulang) untuk satu akun bisnis, dengan harga yang berlaku saat
          pendaftaran dilakukan (lihat halaman harga atau hubungi Kami untuk info terbaru).
        </p>
        <p>
          Pembayaran dilakukan lewat metode yang Kami informasikan saat proses aktivasi (mis.
          transfer bank), dikonfirmasi lewat WhatsApp/telepon yang Kami cantumkan di aplikasi.
          Aktivasi akun dilakukan secara manual oleh Kami setelah pembayaran diterima dan
          diverifikasi — proses ini biasanya memakan waktu, bukan instan.
        </p>
        <p>
          Kebijakan pengembalian dana (refund) ditentukan berdasarkan kesepakatan terpisah dengan
          Kami pada saat pembelian, kecuali diwajibkan lain oleh hukum yang berlaku.
        </p>
      </Section>

      <Section title="4. Kewajiban Pengguna">
        <ul className="list-disc space-y-1 pl-5">
          <li>Memberikan data yang benar dan terkini (data bisnis, data karyawan, data pembayaran).</li>
          <li>Menjaga kerahasiaan kredensial akun (email, password, PIN absen karyawan).</li>
          <li>
            Memperoleh persetujuan yang diperlukan dari karyawan sebelum memasukkan data pribadi
            mereka (termasuk foto selfie absensi dan lokasi) ke dalam Layanan.
          </li>
          <li>Tidak menyalahgunakan Layanan untuk tujuan yang melanggar hukum.</li>
        </ul>
      </Section>

      <Section title="5. Data & Privasi">
        <p>
          Pengelolaan data pribadi dalam Layanan diatur dalam{" "}
          <Link href="/kebijakan-privasi" className="font-medium text-brand-600 hover:underline">
            Kebijakan Privasi
          </Link>{" "}
          kami, yang merupakan bagian tak terpisahkan dari Syarat & Ketentuan ini.
        </p>
      </Section>

      <Section title="6. Batasan Tanggung Jawab">
        <p>
          Layanan disediakan &ldquo;sebagaimana adanya&rdquo;. Kami berupaya menjaga keakuratan perhitungan
          payroll (termasuk PPh 21 dan BPJS) sesuai aturan yang berlaku, namun Pengguna tetap
          bertanggung jawab memverifikasi hasil perhitungan sebelum digunakan untuk kewajiban resmi
          (pelaporan pajak, pembayaran ke karyawan, dll). Kami tidak bertanggung jawab atas kerugian
          tidak langsung yang timbul dari penggunaan Layanan.
        </p>
      </Section>

      <Section title="7. Penghentian Akun">
        <p>
          Kami berhak menangguhkan atau menghentikan akses akun yang terbukti melanggar Syarat &
          Ketentuan ini, termasuk penyalahgunaan sistem atau penipuan pembayaran.
        </p>
      </Section>

      <Section title="8. Perubahan Ketentuan">
        <p>
          Kami dapat memperbarui Syarat & Ketentuan ini sewaktu-waktu. Perubahan material akan
          diinformasikan lewat email atau pemberitahuan di aplikasi.
        </p>
      </Section>

      <Section title="9. Kontak">
        <p>
          Pertanyaan seputar Syarat & Ketentuan ini bisa dikirim lewat kontak yang tertera di
          aplikasi.
        </p>
      </Section>
    </div>
  );
}
