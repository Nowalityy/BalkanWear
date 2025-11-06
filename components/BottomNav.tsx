"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslation } from "@/hooks/useTranslation"

export function BottomNav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { t } = useTranslation()

  if (!session) return null

  const navItems = [
    { href: "/listings", label: t("header.announcements"), icon: "📋" },
    { href: "/listings/new", label: t("header.sell"), icon: "➕" },
    { href: "/orders", label: t("header.orders"), icon: "📦" },
    { href: "/messages", label: t("header.messages"), icon: "💬" },
    { href: "/profile", label: t("header.profile"), icon: "👤" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t-2 border-[#E5E7EB]/50 z-50 md:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex justify-around items-center h-18 px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/listings" && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ease-out relative group ${
                isActive
                  ? "text-[#54a3ac]"
                  : "text-[#6B7280] hover:text-[#54a3ac]"
              }`}
            >
              <span className={`text-2xl mb-1 transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              <span className={`text-xs font-semibold transition-all duration-300 ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#54a3ac] rounded-full"></span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
