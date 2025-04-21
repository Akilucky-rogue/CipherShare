"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Shield } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/files",
      label: "My Files",
      active: pathname === "/files",
    },
    {
      href: "/shared",
      label: "Shared",
      active: pathname === "/shared",
    },
    {
      href: "/audit",
      label: "Audit Logs",
      active: pathname === "/audit",
    },
  ]

  return (
    <div className="flex items-center gap-6 md:gap-10">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">CipherShare</span>
      </Link>
      <nav className="flex items-center gap-6">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              route.active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
