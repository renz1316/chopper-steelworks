import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { fmtQty, getProfile, matName, stockState } from "@/lib/cs";

export default async function Dashboard() {
  const { supabase, user } = await getProfile();
  const { data } = await supabase.from("material")
        .select("id, category, name, unit, current_stock, low_stock_level").eq("is_active", true);
  const rows = (data ?? []).map((m) => ({ ...m, state: stockState(Number(m.current_stock), Number(m.low_stock_level)) }));
  const out = rows.filter((r) => r.state === "out");
  const low = rows.filter((r) => r.state === "low");
  const alerts = [...out, ...low];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hello, {user.full_name}</h1>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-red-100 p-3 text-red-900"><p className="text-3xl font-extrabold">{out.length}</p><p className="text-sm font-semibold">Out of stock</p></div>
        <div className="rounded-xl bg-amber-100 p-3 text-amber-900"><p className="text-3xl font-extrabold">{low.length}</p><p className="text-sm font-semibold">Low stock</p></div>
        <div className="rounded-xl bg-white p-3"><p className="text-3xl font-extrabold">{rows.length}</p><p className="text-sm font-semibold text-slate-600">Materials</p></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/stock?type=IN" className="flex h-16 items-center justify-center gap-2 rounded-xl bg-[#C2410C] text-lg font-bold text-white hover:bg-[#9A3412]"><ArrowDownToLine className="h-6 w-6" />Stock-in</Link>
        <Link href="/stock?type=OUT" className="flex h-16 items-center justify-center gap-2 rounded-xl bg-[#1F2933] text-lg font-bold text-white hover:bg-black"><ArrowUpFromLine className="h-6 w-6" />Stock-out</Link>
      </div>
      <section>
        <h2 className="mb-3 text-lg font-bold">Needs attention</h2>
        {alerts.length ? (
          <ul className="space-y-3">
            {alerts.map((m) => (
              <li key={m.material_id} className="flex items-center justify-between gap-3 rounded-xl bg-white p-4">
                <div className="min-w-0">
                  <p className="font-bold">{matName(m)}</p>
                  <p className="text-sm text-slate-600">{fmtQty(m.current_qty)} {m.unit} left · warning level {fmtQty(m.low_stock_level)}</p>
                  <span className={`mt-1 inline-block rounded px-2 py-0.5 text-sm font-bold ${m.state === "out" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"}`}>
                    {m.state === "out" ? "OUT OF STOCK" : "LOW"}
                  </span>
                </div>
                <Link href={`/stock?type=IN&m=${m.material_id}`} className="flex h-12 shrink-0 items-center rounded-lg border-2 border-[#C2410C] px-4 text-sm font-bold text-[#C2410C]">Stock-in</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-white p-4">All materials are above their warning levels.</p>
        )}
      </section>
      <Link href="/jobs" className="flex h-14 items-center justify-center rounded-xl border-2 border-[#1F2933] text-base font-bold">View job orders</Link>
    </div>
  );
}
