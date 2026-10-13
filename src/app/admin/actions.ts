"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/admin/guard";

export async function markBusinessPaid(businessId: string) {
  const service = await requirePlatformAdmin();

  const { error } = await service
    .from("businesses")
    .update({ payment_status: "paid", paid_at: new Date().toISOString() })
    .eq("id", businessId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}

export async function markBusinessUnpaid(businessId: string) {
  const service = await requirePlatformAdmin();

  const { error } = await service
    .from("businesses")
    .update({ payment_status: "unpaid", paid_at: null })
    .eq("id", businessId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}
