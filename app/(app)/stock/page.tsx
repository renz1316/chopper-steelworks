import { Suspense } from "react";
import { getProfile } from "@/lib/cs";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { StockForm } from "./stock-form";

async function StockData({ type }: { type: "IN" | "OUT" }) {
  const { user } = await getProfile();
  if (!user) return null;

  const supabase = await createClient();
  
  const [materialsRes, suppliersRes] = await Promise.all([
    supabase.from("material").select("id, name, unit, current_stock").eq("is_active", true).order("name"),
    supabase.from("supplier").select("id, name").order("name")
  ]);

  return (
    <StockForm 
      materials={materialsRes.data || []} 
      suppliers={suppliersRes.data || []} 
      type={type} 
    />
  );
}

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const type = params.type === "IN" ? "IN" : "OUT";

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24 space-y-6">
      <h1 className="text-2xl font-bold">Stock</h1>
      
      <div className="grid grid-cols-2 gap-3">
        <Link 
          href="/stock?type=IN" 
          className={`flex h-16 items-center justify-center gap-2 rounded-xl text-lg font-bold text-white transition-colors ${type === "IN" ? "bg-[#C2410C]" : "bg-gray-400 hover:bg-gray-500"}`}
        >
          <ArrowDownToLine className="h-5 w-5" /> Stock-in
        </Link>
        <Link 
          href="/stock?type=OUT" 
          className={`flex h-16 items-center justify-center gap-2 rounded-xl text-lg font-bold text-white transition-colors ${type === "OUT" ? "bg-[#1F2933]" : "bg-gray-400 hover:bg-gray-500"}`}
        >
          <ArrowUpFromLine className="h-5 w-5" /> Stock-out
        </Link>
      </div>

      <Suspense fallback={<div className="p-4 text-gray-500">Loading form...</div>}>
        <StockData type={type} />
      </Suspense>
    </div>
  );
}