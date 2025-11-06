"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useTranslation } from "@/hooks/useTranslation"

interface User {
  id: string
  name?: string | null
  username?: string | null
  email: string
  city?: string | null
  role: string
  image?: string | null
  createdAt: string
  _count: {
    listings: number
    buyerOrders: number
    sellerOrders: number
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchUsers()
    }
  }, [status, router, roleFilter])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()
      if (roleFilter) params.append("role", roleFilter)
      if (search) params.append("search", search)

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          router.push("/")
          return
        }
        throw new Error(data.error || t("admin.error"))
      }

      setUsers(data)
    } catch (err: any) {
      setError(err.message || t("admin.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleSuspend = async (userId: string, currentRole: string) => {
    const action = currentRole === "SUSPENDED" ? "activate" : "suspend"
    const confirmMessage =
      action === "suspend"
        ? t("admin.users.confirmSuspend")
        : t("admin.users.confirmActivate")

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("admin.users.updateError"))
      }

      // Rafraîchir la liste
      fetchUsers()
    } catch (err: any) {
      alert(err.message || t("admin.error"))
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers()
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

  if (!session) {
    return null
  }

  const roleLabels: Record<string, string> = {
    USER: t("admin.users.user"),
    ADMIN: t("admin.users.administrator"),
    SUSPENDED: t("admin.users.suspended"),
  }

  const roleColors: Record<string, string> = {
    USER: "bg-blue-100 text-blue-800",
    ADMIN: "bg-purple-100 text-purple-800",
    SUSPENDED: "bg-red-100 text-red-800",
  }

  return (
    <div className="min-h-screen bg-[#E8F4F5]">
      <Header />
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">{t("admin.backToDashboard")}</Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827]">{t("admin.users.title")}</h1>
          <p className="text-[#6B7280] mt-1">{t("admin.users.subtitle")}</p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#D1E7E9] p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              type="text"
              placeholder={t("admin.users.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-[#D1E7E9] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#54a3ac] bg-white text-[#111827]"
            >
              <option value="">{t("admin.users.allRoles")}</option>
              <option value="USER">{t("admin.users.user")}</option>
              <option value="ADMIN">{t("admin.users.administrator")}</option>
              <option value="SUSPENDED">{t("admin.users.suspended")}</option>
            </select>
            <Button type="submit">{t("common.search")}</Button>
          </form>
        </div>

        {error && (
          <div className="bg-white border border-[#EF4444] text-[#EF4444] px-4 py-3 rounded-[12px] mb-6">
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#D1E7E9] p-12 text-center">
            <p className="text-[#6B7280]">{t("admin.users.noUsersFound")}</p>
          </div>
        ) : (
          <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#D1E7E9] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E5E7EB]">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      {t("admin.users.user")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      {t("admin.users.statistics")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      {t("admin.users.role")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      {t("admin.users.registration")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      {t("admin.users.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E5E7EB]">
                  {users.map((user) => {
                    const totalOrders = user._count.buyerOrders + user._count.sellerOrders
                    const listingsText = user._count.listings === 1 
                      ? `${user._count.listings} ${t("admin.users.announcement")}`
                      : `${user._count.listings} ${t("admin.users.announcements")}`
                    const ordersText = totalOrders === 1
                      ? `${totalOrders} ${t("admin.users.order")}`
                      : `${totalOrders} ${t("admin.users.orders")}`

                    return (
                      <tr key={user.id} className="hover:bg-[#F9FAFB]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <Image
                                src={user.image}
                                alt={user.name || t("admin.users.user")}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-[#E8F4F5] border border-[#D1E7E9] rounded-full flex items-center justify-center">
                                <span className="text-[#6B7280] text-sm">
                                  {(user.name || user.username || user.email || "U")[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-[#111827]">
                                {user.name || user.username || t("admin.users.user")}
                              </div>
                              {user.city && (
                                <div className="text-sm text-[#6B7280]">{user.city}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#111827]">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280]">
                          <div className="space-y-1">
                            <div>{listingsText}</div>
                            <div>{ordersText}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              roleColors[user.role] || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {roleLabels[user.role] || user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280]">
                          {new Date(user.createdAt).toLocaleDateString("en-US")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {user.role !== "ADMIN" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleSuspend(user.id, user.role)}
                              className={
                                user.role === "SUSPENDED"
                                  ? "text-green-600 hover:text-green-700"
                                  : "text-red-600 hover:text-red-700"
                              }
                            >
                              {user.role === "SUSPENDED" ? t("admin.users.activate") : t("admin.users.suspend")}
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
