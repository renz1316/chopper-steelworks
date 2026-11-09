"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function StockForm({ materials, suppliers, type }: { materials: any[], suppliers: any[], type: "IN" | "OUT" }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [materialId, setMaterialId] = useState("");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialId || !qty) return setError("Please select a material and quantity.");
    
    setLoading(true);
    setError("");

    // Call the database function (record_stock)
        const { error: rpcError } = await supabase.rpc("record_stock", {
      p_material_id: Number(materialId),
      p_type: type,
      p_qty: Number(qty),
      p_supplier_id: supplierId ? Number(supplierId) : null,
      p_reason: note || "Manual stock update"
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
    } else {
      setLoading(false);
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
      <h2 className="text-xl font-bold">Record stock ({type})</h2>
      
      {error && <div className="p-3 bg-red-100 text-red-700 rounded font-bold">{error}</div>}

      <div>
        <label className="block text-sm font-bold mb-1">Material</label>
        <select value={materialId} onChange={e => setMaterialId(e.target.value)} className="w-full border p-3 rounded-lg bg-white" required>
          <option value="">Choose a material</option>
          {materials?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.unit}) - {m.current_stock} left
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Quantity</label>
        <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} className="w-full border p-3 rounded-lg bg-white" required />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Supplier (optional)</label>
        <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full border p-3 rounded-lg bg-white">
          <option value="">None</option>
          {suppliers?.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Note (optional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full border p-3 rounded-lg bg-white" placeholder="Reason or remarks" />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-[#1F2933] text-white p-3 rounded-lg font-bold mt-2 disabled:opacity-50">
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}