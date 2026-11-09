"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function JobForm({ materials, products, customers }: { materials: any[], products: any[], customers: any[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [customerId, setCustomerId] = useState("");
  const [custName, setCustName] = useState("");
  const [custcontact, setCustcontact] = useState("");
  const [custAddress, setCustAddress] = useState("");
  
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [downRequired, setDownRequired] = useState("");
  const [installation, setInstallation] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  
  const [jobMaterials, setJobMaterials] = useState([{ material_id: "", quantity: "" }]);

  const addMaterial = () => setJobMaterials([...jobMaterials, { material_id: "", quantity: "" }]);
  const removeMaterial = (index: number) => setJobMaterials(jobMaterials.filter((_, i) => i !== index));
  const updateMaterial = (index: number, field: string, value: string) => {
    const newMats = [...jobMaterials];
    newMats[index] = { ...newMats[index], [field]: value };
    setJobMaterials(newMats);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validMaterials = jobMaterials.filter(m => m.material_id && Number(m.quantity) > 0);

    // Convert string values to actual numbers/null to prevent database errors
    const { data, error: rpcError } = await supabase.rpc("create_job", {
      p_customer_id: customerId || null,
      p_cust_name: customerId ? null : custName,
      p_cust_contact: customerId ? null : custcontact,
      p_cust_address: customerId ? null : custAddress,
      p_product_id: productId || null,
      p_quantity: Number(quantity) || 1,
      p_price: Number(price) || 0,
      p_down_required: Number(downRequired) || 0,
      p_installation: installation,
      p_due: dueDate || null,
      p_description: description || null,
      p_materials: validMaterials.map(m => ({ material_id: m.material_id, quantity: Number(m.quantity) }))
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
    } else {
      router.push(`/jobs/${data}`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow-sm border">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded font-medium">{error}</div>}
      
      <div>
        <label className="block text-sm font-bold mb-1 text-gray-700">Customer</label>
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500">
          <option value="">-- New Customer --</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {!customerId && (
        <div className="grid grid-cols-1 gap-2 p-3 border rounded bg-gray-50">
          <input type="text" placeholder="Full Name" value={custName} onChange={e => setCustName(e.target.value)} required className="w-full border p-2 rounded" />
          <input type="text" placeholder="contact Number" value={custcontact} onChange={e => setCustcontact(e.target.value)} className="w-full border p-2 rounded" />
          <input type="text" placeholder="Address" value={custAddress} onChange={e => setCustAddress(e.target.value)} className="w-full border p-2 rounded" />
        </div>
      )}

      <div>
        <label className="block text-sm font-bold mb-1 text-gray-700">Product or service (optional)</label>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500">
          <option value="">None</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1 text-gray-700">Design / description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded" rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1 text-gray-700">Quantity</label>
          <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-gray-700">Agreed price (PHP)</label>
          <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full border p-2 rounded" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1 text-gray-700">Due date (optional)</label>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border p-2 rounded" />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" checked={installation} onChange={e => setInstallation(e.target.checked)} id="install" className="w-5 h-5" />
        <label htmlFor="install" className="text-sm font-bold text-gray-700">Includes installation</label>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-bold mb-2 text-gray-700">Materials needed (deducted when the job starts)</label>
        {jobMaterials.map((m, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <select value={m.material_id} onChange={e => updateMaterial(i, "material_id", e.target.value)} className="flex-1 border p-2 rounded focus:ring-2 focus:ring-orange-500">
              <option value="">Select Material</option>
              {materials.map(mat => <option key={mat.id} value={mat.id}>{mat.name} ({mat.unit})</option>)}
            </select>
            <input type="number" placeholder="Qty" value={m.quantity} onChange={e => updateMaterial(i, "quantity", e.target.value)} className="w-24 border p-2 rounded" />
            <button type="button" onClick={() => removeMaterial(i)} className="p-2 text-red-500 font-bold border rounded hover:bg-red-50">X</button>
          </div>
        ))}
        <button type="button" onClick={addMaterial} className="text-sm font-bold text-orange-600 hover:text-orange-700 mt-2">+ Add material</button>
      </div>

      <button type="submit" disabled={loading} className="w-full bg-[#C2410C] text-white p-3 rounded-lg font-bold mt-6 disabled:opacity-50 hover:bg-orange-800 transition-colors">
        {loading ? "Saving..." : "Save job order"}
      </button>
    </form>
  );
}