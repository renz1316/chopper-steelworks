"use client";

import { useActionState, useState } from "react";
import { signIn } from "@/app/actions";

const FIELD = "h-14 w-full rounded-lg border border-slate-400 bg-white px-4 text-base text-slate-900 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/30";

export function LoginForm() {
  const [error, action, pending] = useActionState(signIn, null);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  return (
    <form action={action} className="mt-8 flex flex-col gap-2">
      <label htmlFor="username" className="text-base font-semibold">Username</label>
      <input id="username" name="username" autoComplete="username" autoCapitalize="none" value={u} onChange={(e) => setU(e.target.value)} className={FIELD} />
      <label htmlFor="password" className="mt-3 text-base font-semibold">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} className={FIELD} />
      {error && <p role="alert" className="mt-2 text-base font-medium text-red-700">{error}</p>}
      <button type="submit" disabled={pending || !u.trim() || !p}
        className="mt-5 h-14 rounded-lg bg-[#C2410C] text-lg font-bold text-white hover:bg-[#9A3412] active:bg-[#7C2D12] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">
        {pending ? "Signing in..." : "Log in"}
      </button>
    </form>
  );
}
