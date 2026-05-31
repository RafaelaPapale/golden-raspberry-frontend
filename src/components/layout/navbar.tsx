"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award } from "lucide-react";
import { cn } from "@/src/lib/utils";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/movies", label: "Movies List" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm">
            <Award className="size-4.5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-foreground">
              Golden Raspberry Awards
            </span>
            <span className="block text-xs text-muted-foreground">
              Worst Picture Nominees
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "font-medium text-amber-800"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {link.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-amber-500"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
