import { Phone } from "lucide-react";
import { fmtQty, getProfile, matName, one, stockState } from "@/lib/cs";

type Sup = { name: string; contact_number: string | null };

export default async function Restock() {
  const { supabase } = await getProfile();
  const { data } = await supabase.from("material")
    .select("material_id, category, specification, unit, current_qty, low_stock_level, material_supplier(supplier(name, contact_number))")
    .eq("is_active", true);
  const rows = (data ?? [])
    .map((m) => ({ ...m, state: stockState(Number(m.current_qty), Number(m.low_stock_level)) }))
    .filter((m) => m.state !== "ok")
    .sort((a, b) => Number(a.current_qty) - Number(b.current_qty));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Restock list</h1>
      <p className="text-slate-600">Materials at or below their warning level, with the suppliers to call.</p>
      {rows.length ? (
        <ul className="space-y-3">
          {rows.map((m) => {
            const sups = (m.material_supplier as { supplier: Sup | Sup[] | null }[]).map((x) => one(x.supplier)).filter(Boolean) as Sup[];
            return (
              <li key={m.material_id} className="rounded-xl bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{matName(m)}</p>
                    <p className="text-sm text-slate-600">{fmtQty(m.current_qty)} {m.unit} left · warning level {fmtQty(m.low_stock_level)}</p>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-sm font-bold ${m.state === "out" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"}`}>{m.state === "out" ? "OUT" : "LOW"}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sups.length ? sups.map((s) => (
                    <a key={s.name} href={`tel:${s.contact_number ?? ""}`} className="flex h-12 items-center gap-2 rounded-lg border-2 border-[#1F2933] px-4 text-sm font-bold">
                      <Phone className="h-4 w-4" />{s.name}{s.contact_number ? ` · ${s.contact_number}` : ""}
                    </a>
                  )) : <span className="text-sm text-slate-600">No supplier linked yet.</span>}
                </div>
              </li>
            );
          })}
        </ul>
      ) : <p className="rounded-xl bg-white p-4">Nothing to restock right now.</p>}
    </div>
  );
}
