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

interface Listing {
  id: string
  title: string
  price: number
  status: string
  images: string
  createdAt: string
  user: {
    id: string
    name?: string | null
    username?: string | null
    email: string
  }
}

export default function AdminListingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchListings()
    }
  }, [status, router, statusFilter])

  const fetchListings = async () => {
    setIsLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append("status", statusFilter)
      if (search) params.append("search", search)

      const response = await fetch(`/api/admin/listings?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          router.push("/")
          return
        }
        throw new Error(data.error || t("admin.error"))
      }

      setListings(data)
    } catch (err: any) {
      setError(err.message || t("admin.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (listingId: string) => {
    if (!confirm(t("admin.listings.confirmDelete"))) {
      return
    }

    try {
      const response = await fetch(`/api/admin/listings?id=${listingId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("admin.listings.deleteError"))
      }

      // Rafraîchir la liste
      fetchListings()
    } catch (err: any) {
      alert(err.message || t("admin.error"))
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchListings()
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

  const statusLabels: Record<string, string> = {
    ACTIVE: t("admin.listings.active"),
    SOLD: t("admin.listings.sold"),
    DELETED: t("admin.listings.deleted"),
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    SOLD: "bg-blue-100 text-blue-800",
    DELETED: "bg-red-100 text-red-800",
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
          <h1 className="text-3xl font-bold text-[#111827]">{t("admin.listings.title")}</h1>
          <p className="text-[#6B7280] mt-1">{t("admin.listings.subtitle")}</p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#D1E7E9] p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              type="text"
              placeholder={t("admin.listings.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-[#D1E7E9] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#54a3ac] bg-white text-[#111827]"
            >
              <option value="">{t("admin.listings.allStatuses")}</option>
              <option value="ACTIVE">{t("admin.listings.active")}</option>
              <option value="SOLD">{t("admin.listings.sold")}</option>
              <option value="DELETED">{t("admin.listings.deleted")}</option>
            </select>
            <Button type="submit">{t("common.search")}</Button>
          </form>
        </div>

        {error && (
          <div className="bg-white border border-[#EF4444] text-[#EF4444] px-4 py-3 rounded-[12px] mb-6">
            {error}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#D1E7E9] p-12 text-center">
            <p className="text-[#6B7280]">{t("admin.listings.noListingsFound")}</p>
          </div>
        ) : (
          <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#D1E7E9] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E5E7EB]">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      {t("admin.listings.listing")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      {t("admin.listings.seller")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      {t("admin.listings.price")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      {t("admin.listings.status")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      {t("admin.listings.date")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                      {t("admin.listings.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E5E7EB]">
                  {listings.map((listing) => {
                    const imageUrl = listing.images ? listing.images.split(",")[0] : null
                    const formattedPrice = new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "EUR",
                    }).format(listing.price)

                    return (
                      <tr key={listing.id} className="hover:bg-[#F9FAFB]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {imageUrl ? (
                              <div className="relative w-12 h-12 rounded-[12px] overflow-hidden bg-[#E8F4F5] border border-[#D1E7E9] flex-shrink-0">
                                <Image
                                  src={imageUrl}
                                  alt={listing.title}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-[#E8F4F5] border border-[#D1E7E9] rounded-[12px] flex items-center justify-center flex-shrink-0">
                                <span className="text-[#6B7280] text-xs">Img</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/listings/${listing.id}`}
                                className="text-sm font-medium text-[#111827] hover:text-[#54a3ac] hover:underline truncate block"
                              >
                                {listing.title}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#111827]">
                            {listing.user.name || listing.user.username || t("admin.users.user")}
                          </div>
                          <div className="text-sm text-[#6B7280]">{listing.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#111827]">
                          {formattedPrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              statusColors[listing.status] || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {statusLabels[listing.status] || listing.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280]">
                          {new Date(listing.createdAt).toLocaleDateString("en-US")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(listing.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            {t("common.delete")}
                          </Button>
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
