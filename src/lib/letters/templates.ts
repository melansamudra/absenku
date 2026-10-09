export type LetterKind = "sp1" | "sp2" | "sp3" | "sk";

export const LETTER_KINDS: Record<LetterKind, string> = {
  sp1: "Surat Peringatan 1 (SP1)",
  sp2: "Surat Peringatan 2 (SP2)",
  sp3: "Surat Peringatan 3 (SP3)",
  sk: "Surat Keterangan (SK)",
};

export function isLetterKind(v: string): v is LetterKind {
  return v in LETTER_KINDS;
}

// Template awal — admin bebas mengubah isinya sebelum surat disimpan.
export function letterTemplate(
  kind: LetterKind,
  employeeName: string,
  businessName: string,
): { subject: string; body: string } {
  const name = employeeName || "[nama karyawan]";
  if (kind === "sk") {
    return {
      subject: "Surat Keterangan Kerja",
      body: `Yang bertanda tangan di bawah ini, pimpinan ${businessName}, menerangkan bahwa:\n\nNama: ${name}\n\nbenar merupakan karyawan di ${businessName}. Surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`,
    };
  }
  const level = { sp1: "pertama", sp2: "kedua", sp3: "ketiga (terakhir)" }[kind];
  const consequence =
    kind === "sp3"
      ? "Apabila pelanggaran terulang kembali, perusahaan akan mengambil tindakan tegas berupa pemutusan hubungan kerja sesuai peraturan yang berlaku."
      : "Apabila pelanggaran terulang kembali, perusahaan akan memberikan surat peringatan berikutnya sampai dengan pemutusan hubungan kerja.";
  return {
    subject: `Surat Peringatan ${kind.slice(2)}`,
    body: `Dengan ini ${businessName} memberikan surat peringatan ${level} kepada:\n\nNama: ${name}\n\nkarena telah melakukan pelanggaran: [jelaskan pelanggaran, tanggal, dan kejadiannya].\n\n${consequence}\n\nDemikian surat peringatan ini dibuat agar dapat menjadi perhatian dan diindahkan sebagaimana mestinya.`,
  };
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function defaultLetterNumber(kind: LetterKind, seq: number, isoDate: string) {
  const [year, month] = isoDate.split("-");
  return `${String(seq).padStart(3, "0")}/${kind.toUpperCase()}/${ROMAN[Number(month) - 1] ?? month}/${year}`;
}
