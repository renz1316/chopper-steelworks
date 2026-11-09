"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Hammer, History, LayoutDashboard, PackagePlus } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Home", Icon: LayoutDashboard },
  { href: "/stock", label: "Stock", Icon: PackagePlus },
  { href: "/jobs", label: "Jobs", Icon: Hammer },
  { href: "/restock", label: "Restock", Icon: ClipboardList },
  { href: "/history", label: "History", Icon: History },
];

export function CsNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 print:hidden border-t border-slate-300 bg-white">
      <ul className="mx-auto flex max-w-3xl">
        {ITEMS.map(({ href, label, Icon }) => {
          const on = path.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link href={href} aria-current={on ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-sm font-semibold ${on ? "text-[#C2410C]" : "text-slate-600"}`}>
                <Icon className="h-6 w-6" />{label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
