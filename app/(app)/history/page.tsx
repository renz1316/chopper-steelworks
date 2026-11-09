import { fmtDateTime, fmtQty, getProfile, matName, one } from "@/lib/cs";

type M = { category: string; specification: string; unit: string };

export default async function HistoryPage() {
  const { supabase } = await getProfile();
  const { data } = await supabase.from("stock_transaction")
    .select("txn_id, txn_type, quantity_change, balance_after, reason_note, txn_datetime, material(category, specification, unit), app_user(full_name)")
    .order("txn_datetime", { ascending: false }).limit(50);
  const tone: Record<string, string> = { IN: "bg-green-100 text-green-900", OUT: "bg-slate-200 text-slate-900", ADJUST: "bg-amber-100 text-amber-900" };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Stock history</h1>
      <p className="text-slate-600">The last 50 movements. Saved records are never edited or deleted.</p>
      {data?.length ? (
        <ul className="space-y-3">
          {data.map((t) => {
            const m = one(t.material as M | M[] | null);
            const u = one(t.app_user as { full_name: string } | { full_name: string }[] | null);
            const q = Number(t.quantity_change);
            return (
              <li key={t.txn_id} className="rounded-xl bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold">{m ? matName(m) : "Material"}</p>
                  <span className={`rounded px-2 py-0.5 text-sm font-bold ${tone[t.txn_type]}`}>{t.txn_type}</span>
                </div>
                <p className="mt-1 text-lg font-bold">{q > 0 ? "+" : ""}{fmtQty(q)} {m?.unit} <span className="text-sm font-normal text-slate-600">→ balance {fmtQty(t.balance_after)}</span></p>
                <p className="text-sm text-slate-600">{fmtDateTime(t.txn_datetime)} · {u?.full_name ?? "Staff"}{t.reason_note ? ` · ${t.reason_note}` : ""}</p>
              </li>
            );
          })}
        </ul>
      ) : <p className="rounded-xl bg-white p-4">No stock movements yet. Record a stock-in to see it here.</p>}
    </div>
  );
}
