import { createServiceClient } from "@/lib/supabase/service";
import { getPortalEmployee, loadPortalBusiness } from "@/lib/portal/session";

// Menyajikan foto profil karyawan yang sedang login (bucket privat). URL-nya
// membawa ?v=<nama file> sehingga browser boleh menyimpan lama; ganti foto =
// nama file baru = URL baru.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await loadPortalBusiness(slug);
  if (!business) return new Response("Not found", { status: 404 });
  const employee = await getPortalEmployee(business);
  if (!employee?.photoPath) return new Response("Not found", { status: 404 });

  const supabase = createServiceClient();
  const { data, error } = await supabase.storage.from("employee-photos").download(employee.photoPath);
  if (error || !data) return new Response("Not found", { status: 404 });

  return new Response(data, {
    headers: {
      "Content-Type": data.type || "image/jpeg",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
