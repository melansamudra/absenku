import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/form-ui";
import ReviewForm from "./review-form";

export default async function KpiReviewPage({
  params,
}: {
  params: Promise<{ businessId: string; reviewId: string }>;
}) {
  const { businessId, reviewId } = await params;
  const supabase = await createClient();

  const { data: review } = await supabase
    .from("kpi_reviews")
    .select("id, status, total_score, notes, kpi_schedules(name, form_id, observe_start, observe_end), employees(name, employee_code, positions(name))")
    .eq("id", reviewId)
    .eq("business_id", businessId)
    .maybeSingle();
  if (!review) notFound();

  const schedule = review.kpi_schedules as unknown as { name: string; form_id: string; observe_start: string; observe_end: string } | null;
  const emp = review.employees as unknown as { name: string; employee_code: string | null; positions: { name: string } | null } | null;

  const [{ data: indicators }, { data: scores }] = await Promise.all([
    supabase
      .from("kpi_indicators")
      .select("id, name, description, weight")
      .eq("form_id", schedule?.form_id ?? "")
      .eq("business_id", businessId)
      .order("sort_order"),
    supabase.from("kpi_review_scores").select("indicator_id, score, note").eq("review_id", reviewId).eq("business_id", businessId),
  ]);
  const scoreBy = new Map((scores ?? []).map((s) => [s.indicator_id, s]));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/business/${businessId}/kpi/reviews`} className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700">
        <ChevronLeft size={14} /> Evaluasi
      </Link>
      <PageHeader
        title={emp?.name ?? "Evaluasi KPI"}
        subtitle={[schedule?.name, emp?.positions?.name, emp?.employee_code].filter(Boolean).join(" · ")}
      />
      <ReviewForm
        businessId={businessId}
        reviewId={review.id}
        done={review.status === "done"}
        notes={review.notes ?? ""}
        indicators={(indicators ?? []).map((i) => ({
          id: i.id,
          name: i.name,
          description: i.description ?? "",
          weight: Number(i.weight),
          score: scoreBy.get(i.id) ? Number(scoreBy.get(i.id)!.score) : null,
          note: scoreBy.get(i.id)?.note ?? "",
        }))}
      />
    </div>
  );
}
