"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { ListingForm } from "@/components/ListingForm"
import Link from "next/link"
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
  user: {
    id: string
  }
}

export default function EditListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { t } = useTranslation()

  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    fetchListing()
  }, [id, status, router])

  const fetchListing = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/listings/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("listings.notFound"))
      }

      // Vérifier que l'utilisateur est le propriétaire
      if (session?.user?.id !== data.user.id) {
        router.push(`/listings/${id}`)
        return
      }

      setListing(data)
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("common.error"))
      }

      router.push(`/listings/${id}`)
    } catch (error: any) {
      throw error
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F4F5]">
        <p className="text-[#6B7280]">{t("common.loading")}</p>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F4F5]">
        <div className="text-center">
          <p className="text-[#EF4444] mb-4">{error || t("listings.notFound")}</p>
          <Link href="/listings">
            <Button>{t("listings.backToList")}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E8F4F5] pb-20 md:pb-0">
      <Header />
      <div className="max-w-3xl mx-auto py-6 md:py-12 px-4 md:px-6">
        <div className="mb-6">
          <Link href={`/listings/${id}`}>
            <Button variant="ghost" size="sm">← {t("listings.backToList")}</Button>
          </Link>
        </div>

        <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB] p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#111827] mb-6 md:mb-8">
            {t("listings.edit")}
          </h1>
          <ListingForm
            initialData={{
              title: listing.title,
              description: listing.description,
              price: listing.price.toString(),
              category: listing.category,
              size: listing.size || "",
              brand: listing.brand || "",
              condition: listing.condition as any,
              images: listing.images || "",
            }}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}
