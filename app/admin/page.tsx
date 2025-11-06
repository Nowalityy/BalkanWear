"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "@/hooks/useTranslation"

interface Stats {
  users: {
    total: number
  }
  listings: {
    total: number
    active: number
    sold: number
  }
  orders: {
    total: number
    completed: number
  }
  revenue: {
    total: number
  }
  disputes: number
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchStats()
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(fetchStats, 30000)
      return () => clearInterval(interval)
    }
  }, [status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          router.push("/")
          return
        }
        throw new Error(data.error || t("admin.error"))
      }

      setStats(data)
    } catch (err: any) {
      setError(err.message || t("admin.error"))
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#E8F4F5]">
        <Header />
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="text-center">
            <p className="text-[#6B7280]">{t("admin.loading")}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session || !stats) {
    return null
  }

  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(stats.revenue.total)

  const disputesText = stats.disputes === 1 
    ? t("admin.stats.disputesInProgress", { count: stats.disputes, plural: t("admin.stats.dispute") })
    : t("admin.stats.disputesInProgress", { count: stats.disputes, plural: t("admin.stats.disputes") })

  return (
    <div className="min-h-screen bg-[#E8F4F5]">
      <Header />
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827]">{t("admin.title")}</h1>
          <p className="text-[#6B7280] mt-1">{t("admin.subtitle")}</p>
        </div>

        {error && (
          <div className="bg-white border border-[#EF4444] text-[#EF4444] px-4 py-3 rounded-[12px] mb-6">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#D1E7E9] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">{t("admin.stats.users")}</p>
                <p className="text-3xl font-bold text-[#111827] mt-2">{stats.users.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-[12px] flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#D1E7E9] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">{t("admin.stats.activeListings")}</p>
                <p className="text-3xl font-bold text-[#111827] mt-2">{stats.listings.active}</p>
                <p className="text-xs text-[#6B7280] mt-1">{stats.listings.sold} {t("admin.stats.sold")}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-[12px] flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#D1E7E9] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">{t("admin.stats.orders")}</p>
                <p className="text-3xl font-bold text-[#111827] mt-2">{stats.orders.total}</p>
                <p className="text-xs text-[#6B7280] mt-1">{stats.orders.completed} {t("admin.stats.completed")}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-[12px] flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#D1E7E9] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">{t("admin.stats.revenue")}</p>
                <p className="text-3xl font-bold text-[#111827] mt-2">{formattedRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-[12px] flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes */}
        {stats.disputes > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-[12px] p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-orange-800 font-medium">
                {disputesText}
              </p>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/listings">
            <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#D1E7E9] p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold text-[#111827] mb-2">{t("admin.quickActions.manageListings")}</h2>
              <p className="text-[#6B7280] text-sm mb-4">
                {t("admin.quickActions.manageListingsDesc")}
              </p>
              <Button variant="outline" size="sm">{t("admin.quickActions.access")}</Button>
            </div>
          </Link>

          <Link href="/admin/users">
            <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#D1E7E9] p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold text-[#111827] mb-2">{t("admin.quickActions.manageUsers")}</h2>
              <p className="text-[#6B7280] text-sm mb-4">
                {t("admin.quickActions.manageUsersDesc")}
              </p>
              <Button variant="outline" size="sm">{t("admin.quickActions.access")}</Button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
