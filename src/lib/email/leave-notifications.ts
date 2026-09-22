import { getFromAddress, getResendClient } from "./resend";

function fmtDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00+07:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

type LeaveNotificationInput = {
  employeeEmail: string | null;
  employeeName: string;
  businessName: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
};

// Best-effort: kalau Resend belum di-setup (RESEND_API_KEY kosong) atau
// karyawan tidak punya email, ini diam-diam tidak mengirim apa pun — dipanggil
// SETELAH approve/reject tersimpan di database, jadi kegagalan kirim email
// tidak pernah menggagalkan aksi approve/reject itu sendiri.
export async function sendLeaveApprovedEmail(input: LeaveNotificationInput) {
  const resend = getResendClient();
  if (!resend || !input.employeeEmail) return;

  try {
    await resend.emails.send({
      from: getFromAddress(),
      to: input.employeeEmail,
      subject: `Cuti disetujui — ${input.leaveTypeName}`,
      html: `
        <p>Halo ${input.employeeName},</p>
        <p>Pengajuan cuti kamu di <strong>${input.businessName}</strong> sudah <strong style="color:#059669">disetujui</strong>.</p>
        <p>
          Jenis cuti: ${input.leaveTypeName}<br/>
          Tanggal: ${fmtDate(input.startDate)} — ${fmtDate(input.endDate)}
        </p>
        <p>Selamat berlibur!</p>
      `,
    });
  } catch {
    // Kegagalan kirim email (mis. domain belum diverifikasi) sengaja
    // ditelan di sini — lihat komentar di atas fungsi ini.
  }
}

export async function sendLeaveRejectedEmail(
  input: LeaveNotificationInput & { reviewedNote: string | null },
) {
  const resend = getResendClient();
  if (!resend || !input.employeeEmail) return;

  try {
    await resend.emails.send({
      from: getFromAddress(),
      to: input.employeeEmail,
      subject: `Cuti ditolak — ${input.leaveTypeName}`,
      html: `
        <p>Halo ${input.employeeName},</p>
        <p>Pengajuan cuti kamu di <strong>${input.businessName}</strong> <strong style="color:#dc2626">ditolak</strong>.</p>
        <p>
          Jenis cuti: ${input.leaveTypeName}<br/>
          Tanggal: ${fmtDate(input.startDate)} — ${fmtDate(input.endDate)}
        </p>
        ${input.reviewedNote ? `<p>Catatan admin: ${input.reviewedNote}</p>` : ""}
        <p>Hubungi admin bisnis kamu kalau ada pertanyaan.</p>
      `,
    });
  } catch {
    // Sama seperti sendLeaveApprovedEmail — ditelan dengan sengaja.
  }
}
