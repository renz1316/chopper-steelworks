import Link from "next/link";
import { Plus } from "lucide-react";
import { getProfile } from "@/lib/cs";

type Job = { job_order_id: number; description: string | null; status: string; due_date: string | null; quantity: number; product_name: string | null; materials: { name: string; qty: number; unit: string }[] };
const COLS = ["Pending", "In Progress", "Completed", "Cancelled"];
const TONE: Record<string, string> = { Pending: "bg-amber-100 text-amber-900", "In Progress": "bg-blue-100 text-blue-900", Completed: "bg-green-100 text-green-900", Cancelled: "bg-slate-200 text-slate-800" };

function Card({ j, link }: { j: Job; link: boolean }) {
  const body = (
    <>
      <p className="font-bold">#{j.job_order_id} · {j.product_name ?? j.description ?? "Job order"}{j.quantity > 1 ? ` × ${j.quantity}` : ""}</p>
      {j.product_name && j.description && <p className="text-sm text-slate-700">{j.description}</p>}
      {j.due_date && <p className="text-sm text-slate-600">Due {j.due_date}</p>}
      {j.materials.length > 0 && <p className="mt-1 text-sm text-slate-600">{j.materials.map((m) => `${m.name} × ${m.qty} ${m.unit}`).join(", ")}</p>}
    </>
  );
  const cls = "block rounded-xl bg-white p-4";
  return <li>{link ? <Link href={`/jobs/${j.job_order_id}`} className={`${cls} hover:ring-2 hover:ring-[#C2410C]`}>{body}</Link> : <div className={cls}>{body}</div>}</li>;
}

export default async function Jobs() {
  const { supabase, user } = await getProfile();
  const { data } = await supabase.rpc("job_board");
  const jobs = (data ?? []) as Job[];
  const admin = user.role === "admin";
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Job orders</h1>
        {admin && <Link href="/jobs/new" className="flex h-12 items-center gap-2 rounded-lg bg-[#C2410C] px-4 font-bold text-white hover:bg-[#9A3412]"><Plus className="h-5 w-5" />New job</Link>}
      </div>
      {!admin && <p className="text-slate-600">View only. Customer and payment details are for the owner.</p>}
      {COLS.map((s) => {
        const list = jobs.filter((j) => j.status === s);
        return (
          <section key={s}>
            <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">{s}<span className={`rounded px-2 py-0.5 text-sm ${TONE[s]}`}>{list.length}</span></h2>
            {list.length ? <ul className="space-y-3">{list.map((j) => <Card key={j.job_order_id} j={j} link={admin} />)}</ul> : <p className="text-sm text-slate-600">None</p>}
          </section>
        );
      })}
    </div>
  );
}
