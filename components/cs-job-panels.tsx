"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Printer } from "lucide-react";
import { recordPayment, setJobStatus, startJob, voidPayment, type Result } from "@/app/(app)/jobs/actions";

const F = "h-14 w-full rounded-lg border border-slate-400 bg-white px-4 text-base focus:border-[#C2410C] focus:outline-none";
const PRIMARY = "h-14 w-full rounded-lg bg-[#C2410C] text-lg font-bold text-white hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600";
const OUTLINE = "h-14 w-full rounded-lg border-2 border-[#1F2933] text-base font-bold disabled:opacity-50";

export function JobActions({ jobId, status }: { jobId: number; status: string }) {
  const router = useRouter();
  const [res, setRes] = useState<Result | null>(null);
  const [override, setOverride] = useState("");
  const [pending, start] = useTransition();
  const done = (r: Result) => { if (r.ok) { setRes(null); router.refresh(); } else setRes(r); };

  if (status === "Completed" || status === "Cancelled") return null;
  return (
    <div className="space-y-3">
      {status === "Pending" && <button disabled={pending} onClick={() => start(async () => done(await startJob(jobId, override, false)))} className={PRIMARY}>{pending ? "Working..." : "Start job (deduct materials)"}</button>}
      {status === "In Progress" && <button disabled={pending} onClick={() => start(async () => done(await setJobStatus(jobId, "Completed")))} className={PRIMARY}>Mark completed</button>}
      {res?.text && <p role="alert" className="rounded-lg bg-red-100 p-4 font-semibold text-red-900">{res.text}</p>}
      {res?.shortages && (
        <div role="alert" className="space-y-3 rounded-lg bg-amber-100 p-4 text-amber-950">
          <p className="font-bold">Not enough stock for this job:</p>
          <ul className="list-disc pl-5">{res.shortages.map((s) => <li key={s.material}>{s.material}: needs {s.needed} {s.unit}, only {s.available} on hand</li>)}</ul>
          <input aria-label="Override reason" placeholder="Reason to start anyway" value={override} onChange={(e) => setOverride(e.target.value)} className={F} />
          <button disabled={pending || !override.trim()} onClick={() => start(async () => done(await startJob(jobId, override, false)))} className={OUTLINE}>Start anyway (deducts what is available)</button>
        </div>
      )}
      {res?.needsDown && (
        <div role="alert" className="space-y-3 rounded-lg bg-amber-100 p-4 text-amber-950">
          <p className="font-bold">No down payment recorded for this installation job{res.required ? ` (required: PHP ${res.required})` : ""}.</p>
          <button disabled={pending} onClick={() => start(async () => done(await startJob(jobId, override, true)))} className={OUTLINE}>Start without a down payment</button>
        </div>
      )}
      <button disabled={pending} onClick={() => { if (window.confirm("Cancel this job order? Materials already deducted are not returned automatically.")) start(async () => done(await setJobStatus(jobId, "Cancelled"))); }} className={OUTLINE}>Cancel job</button>
    </div>
  );
}

export function PaymentForm({ jobId, balance }: { jobId: number; balance: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [res, setRes] = useState<Result | null>(null);
  const [pending, start] = useTransition();
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await recordPayment(jobId, Number(amount), method); setRes(r); if (r.ok) { setAmount(""); router.refresh(); } }); }}>
      <input aria-label="Payment amount" type="number" step="0.01" min="0.01" max={balance} placeholder={`Amount (balance ${balance})`} value={amount} onChange={(e) => setAmount(e.target.value)} className={F} required />
      <select aria-label="Payment method" value={method} onChange={(e) => setMethod(e.target.value)} className={F}>
        <option>Cash</option><option>GCash</option><option>Bank transfer</option>
      </select>
      {res?.text && <p role="status" className={`rounded-lg p-4 font-semibold ${res.ok ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>{res.text}{res.ok && res.id ? <> <Link href={`/receipt/${res.id}`} className="underline">Open receipt</Link></> : null}</p>}
      <button type="submit" disabled={pending || !amount} className={PRIMARY}>{pending ? "Saving..." : "Record payment"}</button>
    </form>
  );
}

export function VoidPayment({ paymentId }: { paymentId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (!open) return <button onClick={() => setOpen(true)} className="h-12 rounded-lg border-2 border-red-700 px-4 text-sm font-bold text-red-800">Void</button>;
  return (
    <div className="mt-2 space-y-2">
      <input aria-label="Reason for voiding" placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} className={F} />
      {msg && <p role="alert" className="font-semibold text-red-800">{msg}</p>}
      <button disabled={pending || !reason.trim()} onClick={() => start(async () => { const r = await voidPayment(paymentId, reason); if (r.ok) router.refresh(); else setMsg(r.text ?? "Could not void."); })} className="h-12 rounded-lg bg-red-700 px-4 font-bold text-white disabled:bg-slate-300 disabled:text-slate-600">Confirm void</button>
    </div>
  );
}

export function PrintButton() {
  return <button onClick={() => window.print()} className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-[#1F2933] text-lg font-bold text-white print:hidden"><Printer className="h-5 w-5" />Print receipt</button>;
}
