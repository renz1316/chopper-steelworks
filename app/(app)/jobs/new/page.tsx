import { Suspense } from "react";
import { getProfile } from "@/lib/cs";
import { createClient } from "@/lib/supabase/server";
import { JobForm } from "./job-form";

async function JobFormData() {
  const { user } = await getProfile();
  if (user?.role !== "admin") {
    return <div className="p-4 text-red-600 font-bold">Only the owner can create job orders.</div>;
  }

  const supabase = await createClient();
  
  // Using * guarantees we get the IDs, no matter what the column is named
  const [materialsRes, productsRes, customersRes] = await Promise.all([
    supabase.from("material").select("*").eq("is_active", true).order("name"),
    supabase.from("product").select("*").eq("is_active", true).order("name"),
    supabase.from("customer").select("*").order("name")
  ]);

  return (
    <JobForm 
      materials={materialsRes.data || []} 
      products={productsRes.data || []} 
      customers={customersRes.data || []} 
    />
  );
}

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New job order</h1>
      <Suspense fallback={<div className="p-4 text-gray-500">Loading form...</div>}>
        <JobFormData />
      </Suspense>
    </div>
  );
}