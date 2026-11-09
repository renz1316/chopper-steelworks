import { Suspense, type ReactNode } from "react";
import { CsShell } from "@/components/cs-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-base text-slate-600">Loading...</p>}>
      <CsShell>{children}</CsShell>
    </Suspense>
  );
}
