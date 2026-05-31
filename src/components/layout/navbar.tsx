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
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Award className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-medium">
              Golden Raspberry Awards
            </span>
            <span className="block text-xs text-muted-foreground">
              Worst Picture Nominees
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
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
                  "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  active && "bg-amber-100 text-amber-800 hover:text-amber-800",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}