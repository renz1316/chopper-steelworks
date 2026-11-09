"use server";

import { createClient } from "@/lib/supabase/server";

export type Shortage = { material: string; needed: number; available: number; unit: string };
export type Result = { ok: boolean; text?: string; id?: number; shortages?: Shortage[]; needsDown?: boolean; required?: number | null };

async function rpc(fn: string, args: Record<string, unknown>) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(fn, args);
  return { data, error: error?.message ?? null };
}

export async function createJob(i: {
  customerId: number | null; name: string; contact: string; address: string; productId: number | null;
  description: string; quantity: number; price: number; installation: boolean; downRequired: number | null;
  due: string | null; materials: { material_id: number; qty: number }[];
}): Promise<Result> {
  const { data, error } = await rpc("create_job", {
    p_customer_id: i.customerId, p_cust_name: i.name, p_cust_contact: i.contact, p_cust_address: i.address,
    p_product_id: i.productId, p_description: i.description, p_quantity: i.quantity, p_price: i.price,
    p_installation: i.installation, p_down_required: i.downRequired, p_due: i.due, p_materials: i.materials,
  });
  return error ? { ok: false, text: error } : { ok: true, id: data as number };
}

export async function startJob(jobId: number, override: string, confirmNoDown: boolean): Promise<Result> {
  const { data, error } = await rpc("start_job", { p_job_id: jobId, p_override: override || null, p_confirm_no_down: confirmNoDown });
  if (error) return { ok: false, text: error };
  const r = data as { ok: boolean; shortages?: Shortage[]; needs_down_payment?: boolean; required?: number | null };
  return { ok: r.ok, shortages: r.shortages, needsDown: r.needs_down_payment, required: r.required };
}

export async function setJobStatus(jobId: number, status: "Completed" | "Cancelled"): Promise<Result> {
  const { error } = await rpc("set_job_status", { p_job_id: jobId, p_status: status });
  return error ? { ok: false, text: error } : { ok: true };
}

export async function recordPayment(jobId: number, amount: number, method: string): Promise<Result> {
  const { data, error } = await rpc("record_payment", { p_job_id: jobId, p_amount: amount, p_method: method });
  if (error) return { ok: false, text: error };
  const r = data as { receipt_no: string; payment_id: number };
  return { ok: true, id: r.payment_id, text: `Payment saved. Receipt ${r.receipt_no}.` };
}

export async function voidPayment(paymentId: number, reason: string): Promise<Result> {
  const { error } = await rpc("void_payment", { p_payment_id: paymentId, p_reason: reason });
  return error ? { ok: false, text: error } : { ok: true };
}
