"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createJob } from "@/app/(app)/jobs/actions";

const F = "h-14 w-full rounded-lg border border-slate-400 bg-white px-4 text-base focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/30";
type Row = { material_id: string; qty: string };

export function JobForm({ customers, products, materials }: {
  customers: { customer_id: number; name: string }[];
  products: { product_id: number; name: string; base_price: number }[];
  materials: { material_id: number; label: string; unit: string }[];
}) {
  const router = useRouter();
  const [cust, setCust] = useState("");
  const [cn, setCn] = useState(""); const [cc, setCc] = useState(""); const [ca, setCa] = useState("");
  const [prod, setProd] = useState(""); const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("1"); const [price, setPrice] = useState("");
  const [inst, setInst] = useState(false); const [down, setDown] = useState(""); const [due, setDue] = useState("");
  const [rows, setRows] = useState<Row[]>([{ material_id: "", qty: "" }]);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const setRow = (i: number, p: Partial<Row>) => setRows(rows.map((r, k) => (k === i ? { ...r, ...p } : r)));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await createJob({
        customerId: cust ? Number(cust) : null, name: cn, contact: cc, address: ca,
        productId: prod ? Number(prod) : null, description: desc, quantity: Number(qty) || 1, price: Number(price),
        installation: inst, downRequired: inst && down ? Number(down) : null, due: due || null,
        materials: rows.filter((x) => x.material_id && Number(x.qty) > 0).map((x) => ({ material_id: Number(x.material_id), qty: Number(x.qty) })),
      });
      if (r.ok && r.id) router.push(`/jobs/${r.id}`); else setMsg(r.text ?? "Could not save the job order.");
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="cust" className="mb-1 block font-semibold">Customer</label>
        <select id="cust" value={cust} onChange={(e) => setCust(e.target.value)} className={F}>
          <option value="">New customer</option>
          {customers.map((c) => <option key={c.customer_id} value={c.customer_id}>{c.name}</option>)}
        </select>
      </div>
      {!cust && (
        <div className="space-y-3 rounded-xl bg-white p-4">
          <input aria-label="Customer name" placeholder="Customer name" value={cn} onChange={(e) => setCn(e.target.value)} className={F} />
          <input aria-label="Contact number" placeholder="Contact number" inputMode="tel" value={cc} onChange={(e) => setCc(e.target.value)} className={F} />
          <input aria-label="Address" placeholder="Address (optional)" value={ca} onChange={(e) => setCa(e.target.value)} className={F} />
        </div>
      )}
      <div>
        <label htmlFor="prod" className="mb-1 block font-semibold">Product or service (optional)</label>
        <select id="prod" value={prod} onChange={(e) => { setProd(e.target.value); const p = products.find((x) => String(x.product_id) === e.target.value); if (p && !price) setPrice(String(p.base_price)); }} className={F}>
          <option value="">None</option>
          {products.map((p) => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="desc" className="mb-1 block font-semibold">Design / description</label>
        <input id="desc" value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={300} className={F} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label htmlFor="qty" className="mb-1 block font-semibold">Quantity</label><input id="qty" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} className={F} /></div>
        <div><label htmlFor="price" className="mb-1 block font-semibold">Agreed price (PHP)</label><input id="price" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={F} required /></div>
      </div>
      <div><label htmlFor="due" className="mb-1 block font-semibold">Due date (optional)</label><input id="due" type="date" value={due} onChange={(e) => setDue(e.target.value)} className={F} /></div>
      <label className="flex h-14 items-center gap-3 rounded-lg bg-white px-4 font-semibold">
        <input type="checkbox" checked={inst} onChange={(e) => setInst(e.target.checked)} className="h-6 w-6 accent-[#C2410C]" />Includes installation
      </label>
      {inst && <div><label htmlFor="down" className="mb-1 block font-semibold">Down payment required (PHP)</label><input id="down" type="number" min={0} step="0.01" value={down} onChange={(e) => setDown(e.target.value)} className={F} /></div>}
      <fieldset className="space-y-3">
        <legend className="mb-1 font-semibold">Materials needed (deducted when the job starts)</legend>
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2">
            <select aria-label="Material" value={r.material_id} onChange={(e) => setRow(i, { material_id: e.target.value })} className={`${F} flex-1`}>
              <option value="">Material</option>
              {materials.map((m) => <option key={m.material_id} value={m.material_id}>{m.label} ({m.unit})</option>)}
            </select>
            <input aria-label="Quantity" type="number" step="any" min="0" placeholder="Qty" value={r.qty} onChange={(e) => setRow(i, { qty: e.target.value })} className={`${F} w-24`} />
            <button type="button" aria-label="Remove material" onClick={() => setRows(rows.filter((_, k) => k !== i))} className="flex h-14 w-12 items-center justify-center rounded-lg border border-slate-400 bg-white"><Trash2 className="h-5 w-5" /></button>
          </div>
        ))}
        <button type="button" onClick={() => setRows([...rows, { material_id: "", qty: "" }])} className="flex h-12 items-center gap-2 rounded-lg border-2 border-[#1F2933] px-4 font-bold"><Plus className="h-5 w-5" />Add material</button>
      </fieldset>
      {msg && <p role="alert" className="rounded-lg bg-red-100 p-4 font-semibold text-red-900">{msg}</p>}
      <button type="submit" disabled={pending || !price} className="h-14 w-full rounded-lg bg-[#C2410C] text-lg font-bold text-white hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">{pending ? "Saving..." : "Save job order"}</button>
    </form>
  );
}
