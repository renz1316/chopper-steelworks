import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "clerk";

// Signed-in staff member (redirects to the login page if there is none).
export const getProfile = cache(async () => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/");
  const { data: user } = await supabase.from("app_user").select("user_id, username, full_name, role")
    .eq("auth_user_id", auth.user.id).eq("is_active", true).maybeSingle();
  if (!user) redirect("/");
  return { supabase, user: user as { user_id: number; username: string; full_name: string; role: Role } };
});

export const stockState = (qty: number, level: number) => (qty <= 0 ? "out" : qty <= level ? "low" : "ok");
export const fmtQty = (n: number) => Number(n).toLocaleString("en-PH", { maximumFractionDigits: 2 });
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" });
export const matName = (m: { category: string; name: string }) => (m.name ? `${m.category} · ${m.name}` : m.category);
export function one<T>(x: T | T[] | null | undefined): T | null { return Array.isArray(x) ? (x[0] ?? null) : (x ?? null); }
export const peso = (n: number) => "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
