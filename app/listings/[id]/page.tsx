"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/Header"
import { ReviewList } from "@/components/ReviewList"
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

export default function ListingDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { t } = useTranslation()

  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [sellerReviews, setSellerReviews] = useState<any>(null)
  const [showReviews, setShowReviews] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/listings/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("listings.notFound"))
      }

      setListing(data)
      
      // Charger les avis du vendeur
      if (data.user?.id) {
        fetchSellerReviews(data.user.id)
      }
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSellerReviews = async (userId: string) => {
    try {
      const response = await fetch(`/api/reviews?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setSellerReviews(data)
      }
    } catch (err) {
      // Ignorer l'erreur silencieusement
    }
  }

  const handleDelete = async () => {
    if (!confirm(t("listings.confirmDelete"))) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(t("common.error"))
      }

      router.push("/listings")
    } catch (err: any) {
      alert(err.message || t("common.error"))
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
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

  const images = listing.images ? listing.images.split(",").filter(Boolean) : []
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(listing.price)

  const isOwner = session?.user?.id === listing.user.id

  return (
    <div className="min-h-screen bg-[#E8F4F5] pb-20 md:pb-0">
      <Header />
      <div className="max-w-6xl mx-auto py-6 md:py-12 px-4 md:px-6">
        <div className="mb-6">
          <Link href="/listings">
            <Button variant="ghost" size="sm">← {t("listings.backToList")}</Button>
          </Link>
        </div>

        <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div>
              {images.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-square relative bg-[#E8F4F5] rounded-[12px] overflow-hidden border border-[#E5E7EB]">
                    <Image
                      src={images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover product-image"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {images.slice(1, 5).map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-square relative bg-[#E8F4F5] rounded-[12px] overflow-hidden border border-[#E5E7EB]"
                        >
                          <Image
                            src={img}
                            alt={`${listing.title} ${idx + 2}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 25vw, 12.5vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-[#E8F4F5] rounded-[12px] flex items-center justify-center border border-[#E5E7EB]">
                  <svg
                    className="w-24 h-24 text-[#6B7280]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Détails */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-semibold text-[#111827] mb-2">
                    {listing.title}
                  </h1>
                  <p className="text-2xl md:text-3xl font-semibold text-[#54a3ac] mb-4">
                    {formattedPrice}
                  </p>
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    <Link href={`/listings/${id}/edit`}>
                      <Button variant="outline" size="sm">
                        {t("common.edit")}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? t("common.deleting") : t("common.delete")}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {listing.brand && (
                  <span className="bg-[#E8F4F5] text-[#6B7280] px-3 py-1 rounded-full text-sm border border-[#E5E7EB]">
                    {listing.brand}
                  </span>
                )}
                {listing.size && (
                  <span className="bg-[#E8F4F5] text-[#6B7280] px-3 py-1 rounded-full text-sm border border-[#E5E7EB]">
                    {t("listings.size")} {listing.size}
                  </span>
                )}
                <span className="bg-[#E8F4F5] text-[#6B7280] px-3 py-1 rounded-full text-sm border border-[#E5E7EB]">
                  {t(`listingForm.condition${listing.condition}`)}
                </span>
                <span className="bg-[#E8F4F5] text-[#6B7280] px-3 py-1 rounded-full text-sm border border-[#E5E7EB]">
                  {listing.category}
                </span>
              </div>

              <div className="mb-6">
                <h2 className="font-semibold text-[#111827] mb-2">{t("listings.description")}</h2>
                <p className="text-[#6B7280] whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>

              <div className="border-t border-[#E5E7EB] pt-6">
                <h3 className="font-semibold text-[#111827] mb-4">{t("listings.seller")}</h3>
                <div className="flex items-center gap-3 mb-4">
                  {listing.user.image ? (
                    <Image
                      src={listing.user.image}
                      alt={listing.user.name || t("listings.seller")}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[#E8F4F5] border border-[#E5E7EB] rounded-full flex items-center justify-center">
                      <span className="text-[#111827]">
                        {(listing.user.name || listing.user.username || "V")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-[#111827]">
                      {listing.user.name || listing.user.username || t("listings.seller")}
                    </p>
                    {listing.user.city && (
                      <p className="text-sm text-[#6B7280]">{listing.user.city}</p>
                    )}
                    {sellerReviews && sellerReviews.totalReviews > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${
                                star <= Math.round(sellerReviews.averageRating || 0)
                                  ? "text-yellow-400"
                                  : "text-[#E5E7EB]"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-[#6B7280]">
                          {sellerReviews.averageRating?.toFixed(1)} ({sellerReviews.totalReviews} {t("reviews.totalReviews", { count: sellerReviews.totalReviews })})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Avis du vendeur */}
                {sellerReviews && sellerReviews.totalReviews > 0 && (
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReviews(!showReviews)}
                      className="text-sm"
                    >
                      {showReviews ? t("profile.hideReviews") : t("listings.viewReviews", { count: sellerReviews.totalReviews })}
                    </Button>
                    {showReviews && (
                      <div className="mt-4">
                        <ReviewList
                          reviews={sellerReviews.reviews || []}
                          averageRating={sellerReviews.averageRating}
                          totalReviews={sellerReviews.totalReviews}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {session && !isOwner && listing.status === "ACTIVE" && (
                <div className="mt-6 space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      router.push(`/checkout/${listing.id}`)
                    }}
                  >
                    {t("listings.buyNow")}
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    size="lg"
                    onClick={async () => {
                      try {
                        // Créer ou récupérer la conversation
                        const response = await fetch("/api/conversations", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            listingId: listing.id,
                            sellerId: listing.user.id,
                          }),
                        })

                        const data = await response.json()

                        if (!response.ok) {
                          throw new Error(data.error || t("common.error"))
                        }

                        // Rediriger vers la conversation
                        router.push(`/messages/${data.id}`)
                      } catch (err: any) {
                        alert(err.message || t("common.error"))
                      }
                    }}
                  >
                    {t("listings.contactSeller")}
                  </Button>
                </div>
              )}
              {session && !isOwner && listing.status !== "ACTIVE" && (
                <div className="mt-6">
                  <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-4 text-center">
                    <p className="text-[#6B7280]">{t("listings.notAvailable")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

