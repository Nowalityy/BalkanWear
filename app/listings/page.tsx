"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ListingCard } from "@/components/ListingCard"
import { FilterBar, FilterValues } from "@/components/FilterBar"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/Header"
import { useTranslation } from "@/hooks/useTranslation"

interface Listing {
  id: string
  title: string
  description: string
  price: number
  category: string
  size?: string | null
  brand?: string | null
  condition: string
  images: string
  status: string
  createdAt: string
  user: {
    id: string
    name?: string | null
    username?: string | null
    image?: string | null
    city?: string | null
  }
}

export default function ListingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<FilterValues>({})

  useEffect(() => {
    fetchListings()
  }, [filters])

  const fetchListings = async () => {
    setIsLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()
      params.append("status", "ACTIVE")

      if (filters.category) params.append("category", filters.category)
      if (filters.size) params.append("size", filters.size)
      if (filters.brand) params.append("brand", filters.brand)
      if (filters.condition) params.append("condition", filters.condition)
      if (filters.minPrice) params.append("minPrice", filters.minPrice)
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice)
      if (filters.search) params.append("search", filters.search)

      const response = await fetch(`/api/listings?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("common.error"))
      }

      // S'assurer que data est un tableau
      if (Array.isArray(data)) {
        setListings(data)
      } else {
        console.error("Expected array but got:", data)
        setListings([])
      }
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#E8F4F5] pb-20 md:pb-0">
      <Header />
      <div className="max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-6">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#111827]">{t("listings.title")}</h1>
          <p className="text-[#6B7280] mt-2 text-sm md:text-base">
            {t("listings.subtitle")}
          </p>
        </div>

        {/* Filtres */}
        <FilterBar onFilterChange={setFilters} />

        {/* Liste des annonces */}
        {error && (
          <div className="bg-white border border-[#EF4444] text-[#EF4444] px-4 py-3 rounded-[12px] mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-[#6B7280]">{t("common.loading")}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <p className="text-[#6B7280] mb-4">{t("listings.noResults")}</p>
            {session && (
              <Link href="/listings/new">
                <Button>{t("listings.createFirst")}</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
