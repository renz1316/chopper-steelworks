import { redirect } from "next/navigation";
import { PrintButton } from "@/components/cs-job-panels";
import { fmtDateTime, getProfile, one, peso } from "@/lib/cs";

type Job = { job_order_id: number; agreed_price: number; description: string | null; customer: { name: string; contact_number: string | null } | { name: string; contact_number: string | null }[] | null };

export default async function Receipt({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getProfile();
  if (user.role !== "admin") redirect("/jobs");
  const { data: pay } = await supabase.from("payment")
    .select("payment_id, job_order_id, amount, payment_date, method, receipt_no, is_voided, void_reason, job_order(job_order_id, agreed_price, description, customer(name, contact_number))")
    .eq("payment_id", Number(id)).maybeSingle();
  if (!pay) redirect("/jobs");
  const job = one(pay.job_order as Job | Job[] | null);
  const c = one(job?.customer ?? null);
  const { data: earlier } = await supabase.from("payment").select("amount")
    .eq("job_order_id", pay.job_order_id).eq("is_voided", false).lte("payment_id", pay.payment_id);
  const paidToDate = (earlier ?? []).reduce((s, x) => s + Number(x.amount), 0);

  return (
    <div className="space-y-4">
      <article className="space-y-3 rounded-xl bg-white p-5 print:rounded-none print:p-0">
        <header className="border-b-2 border-slate-900 pb-3 text-center">
          <p className="text-2xl font-extrabold tracking-wide">CHOPPER STEELWORKS</p>
          <p className="font-bold">PAYMENT ACKNOWLEDGMENT</p>
        </header>
        {pay.is_voided && <p className="rounded bg-red-100 p-2 text-center font-bold text-red-800">VOIDED: {pay.void_reason}</p>}
        <p className="flex justify-between"><span>Receipt no.</span><strong>{pay.receipt_no}</strong></p>
        <p className="flex justify-between"><span>Date</span><span>{fmtDateTime(pay.payment_date)}</span></p>
        <p className="flex justify-between"><span>Received from</span><span>{c?.name}</span></p>
        <p className="flex justify-between"><span>Job order</span><span>#{job?.job_order_id}</span></p>
        {job?.description && <p className="flex justify-between gap-4"><span>For</span><span className="text-right">{job.description}</span></p>}
        <p className="flex justify-between"><span>Method</span><span>{pay.method}</span></p>
        <p className="flex justify-between border-t-2 border-slate-900 pt-3 text-xl font-extrabold"><span>Amount received</span><span>{peso(pay.amount)}</span></p>
        <p className="flex justify-between"><span>Balance after this payment</span><span>{peso(Number(job?.agreed_price ?? 0) - paidToDate)}</span></p>
        <p className="pt-2 text-center text-sm text-slate-600">This is a payment acknowledgment, not a BIR official receipt.</p>
      </article>
      <PrintButton />
    </div>
  );
}
