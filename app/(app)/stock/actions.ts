"use server";

import { createClient } from "@/lib/supabase/server";

export async function recordStock(input: {
  materialId: number; type: "IN" | "OUT" | "ADJUST"; qty: number; supplierId: number | null; reason: string;
}): Promise<{ ok: boolean; text: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_stock", {
    p_material_id: input.materialId, p_type: input.type, p_qty: input.qty,
    p_supplier_id: input.supplierId, p_reason: input.reason || null,
  });
  if (error) return { ok: false, text: error.message };
  const r = data as { balance: number; unit: string; low: boolean; out: boolean };
  const warn = r.out ? " This material is now OUT OF STOCK." : r.low ? " Warning: it is at or below its low-stock level." : "";
  return { ok: true, text: `Saved. New quantity: ${r.balance} ${r.unit}.${warn}` };
}
