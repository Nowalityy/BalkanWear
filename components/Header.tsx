"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTranslation } from "@/hooks/useTranslation"
import { LanguageSelector } from "@/components/LanguageSelector"

function AdminLink() {
  const { data: session } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/admin/stats")
        .then((res) => {
          if (res.ok) {
            setIsAdmin(true)
          }
        })
        .catch(() => {
          setIsAdmin(false)
        })
    }
  }, [session])

  if (!isAdmin) return null

  return (
    <Link 
      href="/admin" 
      className="px-4 py-2.5 text-sm font-semibold text-[#6B7280] hover:text-[#54a3ac] hover:bg-[#F0F9FA] rounded-xl transition-all duration-300 ease-out relative group"
    >
      <span className="relative z-10">{t("header.admin")}</span>
      <span className="absolute inset-0 bg-[#54a3ac]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300"></span>
    </Link>
  )
}

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { t } = useTranslation()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
    router.refresh()
    setShowUserMenu(false)
  }

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    if (showUserMenu) {
      const handleClickOutside = () => setShowUserMenu(false)
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E5E7EB]/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#54a3ac] to-[#4a8f96] bg-clip-text text-transparent cursor-pointer group-hover:from-[#4a8f96] group-hover:to-[#54a3ac] transition-all duration-300">
                BalkanWear
              </h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link 
              href="/listings" 
              className="px-4 py-2.5 text-sm font-semibold text-[#6B7280] hover:text-[#54a3ac] hover:bg-[#F0F9FA] rounded-xl transition-all duration-300 ease-out relative group"
            >
              <span className="relative z-10">{t("header.announcements")}</span>
              <span className="absolute inset-0 bg-[#54a3ac]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </Link>

            {status === "loading" ? (
              <div className="px-3 py-2">
                <div className="w-5 h-5 border-2 border-[#E5E7EB] border-t-[#54a3ac] rounded-full animate-spin"></div>
              </div>
            ) : session ? (
              <>
                <Link 
                  href="/listings/new"
                  className="px-4 py-2.5 text-sm font-semibold text-[#6B7280] hover:text-[#54a3ac] hover:bg-[#F0F9FA] rounded-xl transition-all duration-300 ease-out relative group"
                >
                  <span className="relative z-10">{t("header.sell")}</span>
                  <span className="absolute inset-0 bg-[#54a3ac]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                </Link>
                <Link 
                  href="/orders" 
                  className="px-4 py-2.5 text-sm font-semibold text-[#6B7280] hover:text-[#54a3ac] hover:bg-[#F0F9FA] rounded-xl transition-all duration-300 ease-out relative group"
                >
                  <span className="relative z-10">{t("header.orders")}</span>
                  <span className="absolute inset-0 bg-[#54a3ac]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                </Link>
                <Link 
                  href="/messages" 
                  className="px-4 py-2.5 text-sm font-semibold text-[#6B7280] hover:text-[#54a3ac] hover:bg-[#F0F9FA] rounded-xl transition-all duration-300 ease-out relative group"
                >
                  <span className="relative z-10">{t("header.messages")}</span>
                  <span className="absolute inset-0 bg-[#54a3ac]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                </Link>
                <AdminLink />
                
                {/* Sélecteur de langue */}
                <LanguageSelector />
                
                {/* Menu utilisateur */}
                <div className="relative ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(!showUserMenu)
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F0F9FA] transition-all duration-300 ease-out border-2 border-transparent hover:border-[#E5E7EB] active:scale-95"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#E8F4F5] border border-[#E5E7EB] rounded-full flex items-center justify-center">
                        <span className="text-[#111827] text-sm font-medium">
                          {(session.user?.name || session.user?.email || "U")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <svg 
                      className={`w-4 h-4 text-[#6B7280] transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E5E7EB]/50 py-2 z-50 animate-scaleIn backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href="/profile"
                        className="block px-4 py-3 text-sm font-medium text-[#111827] hover:bg-[#F0F9FA] hover:text-[#54a3ac] transition-all duration-200 ease-out rounded-xl mx-1.5 group"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {t("header.profile")}
                        </span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-[#111827] hover:bg-red-50 hover:text-[#EF4444] transition-all duration-200 ease-out rounded-xl mx-1.5 group"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {t("header.logout")}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <LanguageSelector />
                <Link 
                  href="/auth/signin" 
                  className="px-4 py-2.5 text-sm font-semibold text-[#6B7280] hover:text-[#54a3ac] hover:bg-[#F0F9FA] rounded-xl transition-all duration-300 ease-out relative group"
                >
                  <span className="relative z-10">{t("header.login")}</span>
                  <span className="absolute inset-0 bg-[#54a3ac]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">{t("header.signup")}</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Menu mobile */}
          <div className="md:hidden">
            {status === "loading" ? (
              <div className="w-6 h-6 border-2 border-[#E5E7EB] border-t-[#54a3ac] rounded-full animate-spin"></div>
            ) : session ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowUserMenu(!showUserMenu)
                }}
                className="p-2 rounded-lg hover:bg-[#E8F4F5] transition-all duration-200 ease-in-out"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-[#E8F4F5] border border-[#E5E7EB] rounded-full flex items-center justify-center">
                    <span className="text-[#111827] text-sm font-medium">
                      {(session.user?.name || session.user?.email || "U")[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </button>
            ) : (
              <Link href="/auth/signin">
                <Button size="sm">{t("header.login")}</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {showUserMenu && session && (
          <div className="md:hidden border-t border-[#E5E7EB] py-2">
            <div className="px-4 py-2">
              <LanguageSelector />
            </div>
            <Link
              href="/listings/new"
              className="block px-4 py-2 text-sm text-[#111827] hover:bg-[#E8F4F5] hover:text-[#54a3ac] transition-all duration-200 ease-in-out"
              onClick={() => setShowUserMenu(false)}
            >
              {t("header.sell")}
            </Link>
            <Link
              href="/orders"
              className="block px-4 py-2 text-sm text-[#111827] hover:bg-[#E8F4F5] hover:text-[#54a3ac] transition-all duration-200 ease-in-out"
              onClick={() => setShowUserMenu(false)}
            >
              {t("header.orders")}
            </Link>
            <Link
              href="/messages"
              className="block px-4 py-2 text-sm text-[#111827] hover:bg-[#E8F4F5] hover:text-[#54a3ac] transition-all duration-200 ease-in-out"
              onClick={() => setShowUserMenu(false)}
            >
              {t("header.messages")}
            </Link>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-[#111827] hover:bg-[#E8F4F5] hover:text-[#54a3ac] transition-all duration-200 ease-in-out"
              onClick={() => setShowUserMenu(false)}
            >
              {t("header.profile")}
            </Link>
            <AdminLink />
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-[#E8F4F5] hover:text-[#EF4444] transition-all duration-200 ease-in-out"
            >
              {t("header.logout")}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
