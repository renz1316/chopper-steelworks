"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordStock } from "@/app/(app)/stock/actions";

type Mat = { material_id: number; label: string; unit: string; qty: number };
type Type = "IN" | "OUT" | "ADJUST";
const FIELD = "h-14 w-full rounded-lg border border-slate-400 bg-white px-4 text-base focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/30";

export function StockForm({ materials, suppliers, isAdmin, initialType, initialMaterial }: {
  materials: Mat[]; suppliers: { supplier_id: number; name: string }[]; isAdmin: boolean; initialType: Type; initialMaterial: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<Type>(initialType);
  const [mat, setMat] = useState(initialMaterial);
  const [qty, setQty] = useState("");
  const [sup, setSup] = useState("");
  const [reason, setReason] = useState("");
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const m = materials.find((x) => String(x.material_id) === mat);
  const types: { v: Type; label: string }[] = [{ v: "IN", label: "Stock-in" }, { v: "OUT", label: "Stock-out" }, ...(isAdmin ? [{ v: "ADJUST" as Type, label: "Adjust" }] : [])];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await recordStock({ materialId: Number(mat), type, qty: Number(qty), supplierId: type === "IN" && sup ? Number(sup) : null, reason });
      setRes(r);
      if (r.ok) { setQty(""); setReason(""); router.refresh(); }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div role="group" aria-label="Movement type" className="grid grid-cols-3 gap-2">
        {types.map((t) => (
          <button key={t.v} type="button" onClick={() => setType(t.v)} aria-pressed={type === t.v}
            className={`h-14 rounded-lg text-base font-bold ${type === t.v ? "bg-[#C2410C] text-white" : "border border-slate-400 bg-white text-slate-800"}`}>{t.label}</button>
        ))}
      </div>
      <div>
        <label htmlFor="mat" className="mb-1 block font-semibold">Material</label>
        <select id="mat" value={mat} onChange={(e) => setMat(e.target.value)} className={FIELD} required>
          <option value="">Choose a material</option>
          {materials.map((x) => <option key={x.material_id} value={x.material_id}>{x.label} ({x.qty} {x.unit})</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="qty" className="mb-1 block font-semibold">Quantity{m ? ` (${m.unit})` : ""}{type === "ADJUST" ? ", use - to reduce" : ""}</label>
        <input id="qty" type="number" inputMode="decimal" step="any" min={type === "ADJUST" ? undefined : "0.01"} value={qty} onChange={(e) => setQty(e.target.value)} className={FIELD} required />
      </div>
      {type === "IN" && (
        <div>
          <label htmlFor="sup" className="mb-1 block font-semibold">Supplier (optional)</label>
          <select id="sup" value={sup} onChange={(e) => setSup(e.target.value)} className={FIELD}>
            <option value="">None</option>
            {suppliers.map((s) => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="reason" className="mb-1 block font-semibold">{type === "ADJUST" ? "Reason (required)" : "Note (optional)"}</label>
        <input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} className={FIELD} required={type === "ADJUST"} />
      </div>
      {res && <p role="status" className={`rounded-lg p-4 font-semibold ${res.ok ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>{res.text}</p>}
      <button type="submit" disabled={pending || !mat || !qty}
        className="h-14 w-full rounded-lg bg-[#C2410C] text-lg font-bold text-white hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
