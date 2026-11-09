import Link from "next/link";
import { redirect } from "next/navigation";
import { JobActions, PaymentForm, VoidPayment } from "@/components/cs-job-panels";
import { fmtDateTime, getProfile, matName, one, peso } from "@/lib/cs";

type Pay = { payment_id: number; amount: number; payment_date: string; method: string; receipt_no: string; is_voided: boolean; void_reason: string | null };
type JM = { quantity: number; material: { category: string; specification: string; unit: string } | { category: string; specification: string; unit: string }[] | null };
type Cust = { name: string; contact_number: string | null; address: string | null };

export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getProfile();
  if (user.role !== "admin") redirect("/jobs");
  const { data: j } = await supabase.from("job_order")
    .select("job_order_id, description, quantity, agreed_price, has_installation, down_payment_required, status, due_date, customer(name, contact_number, address), product(name), job_order_material(quantity, material(category, specification, unit)), payment(payment_id, amount, payment_date, method, receipt_no, is_voided, void_reason)")
    .eq("job_order_id", Number(id)).maybeSingle();
  if (!j) redirect("/jobs");

  const c = one(j.customer as Cust | Cust[] | null);
  const p = one(j.product as { name: string } | { name: string }[] | null);
  const pays = ((j.payment ?? []) as Pay[]).sort((a, b) => a.payment_id - b.payment_id);
  const paid = pays.filter((x) => !x.is_voided).reduce((s, x) => s + Number(x.amount), 0);
  const balance = Number(j.agreed_price) - paid;

  return (
    <div className="space-y-5">
      <Link href="/jobs" className="flex h-12 items-center font-bold text-[#C2410C]">← Job orders</Link>
      <div>
        <h1 className="text-2xl font-bold">Job #{j.job_order_id}{p ? ` · ${p.name}` : ""}</h1>
        <p className="mt-1 inline-block rounded bg-white px-2 py-0.5 font-bold">{j.status}</p>
        {j.description && <p className="mt-2">{j.description}</p>}
        {j.due_date && <p className="text-slate-600">Due {j.due_date}</p>}
      </div>
      <section className="rounded-xl bg-white p-4">
        <h2 className="font-bold">Customer</h2>
        <p>{c?.name}</p>
        {c?.contact_number && <a href={`tel:${c.contact_number}`} className="inline-flex h-12 items-center text-[#C2410C] underline">{c.contact_number}</a>}
        {c?.address && <p className="text-slate-600">{c.address}</p>}
      </section>
      <section className="rounded-xl bg-white p-4">
        <h2 className="mb-2 font-bold">Money</h2>
        <p className="flex justify-between"><span>Agreed price</span><span>{peso(j.agreed_price)}</span></p>
        <p className="flex justify-between"><span>Paid</span><span>{peso(paid)}</span></p>
        <p className="flex justify-between text-lg font-bold"><span>Balance</span><span>{peso(balance)}</span></p>
        {j.has_installation && <p className="mt-2 text-sm text-slate-600">Installation job{j.down_payment_required ? ` · down payment required ${peso(j.down_payment_required)}` : ""}</p>}
      </section>
      <section className="rounded-xl bg-white p-4">
        <h2 className="mb-2 font-bold">Materials</h2>
        {(j.job_order_material as JM[]).length ? (
          <ul className="space-y-1">{(j.job_order_material as JM[]).map((m, i) => { const mm = one(m.material); return <li key={i}>{mm ? matName(mm) : "Material"} × {m.quantity} {mm?.unit}</li>; })}</ul>
        ) : <p className="text-slate-600">No materials listed.</p>}
      </section>
      <JobActions jobId={j.job_order_id} status={j.status} />
      <section className="space-y-3 rounded-xl bg-white p-4">
        <h2 className="font-bold">Payments</h2>
        {pays.length === 0 && <p className="text-slate-600">No payments yet.</p>}
        {pays.map((x) => (
          <div key={x.payment_id} className="border-b border-slate-200 pb-3 last:border-0">
            <p className={`font-bold ${x.is_voided ? "text-slate-500 line-through" : ""}`}>{peso(x.amount)} · {x.method}</p>
            <p className="text-sm text-slate-600">{x.receipt_no} · {fmtDateTime(x.payment_date)}</p>
            {x.is_voided ? <p className="text-sm font-semibold text-red-800">VOIDED: {x.void_reason}</p> : (
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/receipt/${x.payment_id}`} className="flex h-12 items-center rounded-lg border-2 border-[#1F2933] px-4 text-sm font-bold">Receipt</Link>
                <VoidPayment paymentId={x.payment_id} />
              </div>
            )}
          </div>
        ))}
        {balance > 0 && j.status !== "Cancelled" && <PaymentForm jobId={j.job_order_id} balance={balance} />}
      </section>
    </div>
  );
}
