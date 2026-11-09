import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions";
import { getProfile } from "@/lib/cs";
import { CsNav } from "@/components/cs-nav";

export async function CsShell({ children }: { children: ReactNode }) {
  const { user } = await getProfile();
  return (
    <div className="min-h-screen bg-[#EEF0F2] pb-24 text-base text-slate-900">
      <header className="bg-[#1F2933] text-white print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-lg font-extrabold tracking-wide">CHOPPER <span className="text-orange-400">STEELWORKS</span></p>
            <p className="text-sm text-slate-300">{user.full_name} · {user.role === "admin" ? "Administrator" : "Inventory clerk"}</p>
          </div>
          <form action={signOut}>
            <button className="flex h-12 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-white/10"><LogOut className="h-5 w-5" />Log out</button>
          </form>
        </div>
        <div className="h-1 bg-[#C2410C]" />
      </header>
      <main className="mx-auto max-w-3xl px-4 py-5">{children}</main>
      <CsNav />
    </div>
  );
}
