"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "@/hooks/useTranslation"

interface Review {
  id: string
  rating: number
  comment?: string | null
  createdAt: string
  reviewer: {
    id: string
    name?: string | null
    username?: string | null
    image?: string | null
  }
  order: {
    listing: {
      id: string
      title: string
      images: string
    }
  }
}

interface ReviewListProps {
  reviews: Review[]
  averageRating?: number
  totalReviews?: number
}

export function ReviewList({ reviews, averageRating, totalReviews }: ReviewListProps) {
  const { t } = useTranslation()

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-[#6B7280]">
        <p>{t("reviews.noReviews")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {(averageRating !== undefined || totalReviews !== undefined) && (
        <div className="bg-[#E8F4F5] rounded-[12px] p-6 border border-[#E5E7EB]">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-semibold text-[#111827]">
                {averageRating?.toFixed(1) || "0.0"}
              </div>
              <div className="flex gap-1 mt-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg ${
                      star <= Math.round(averageRating || 0)
                        ? "text-yellow-400"
                        : "text-[#E5E7EB]"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="text-sm text-[#6B7280] mt-1">
                {t("reviews.totalReviews", { count: totalReviews || 0 })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => {
          const imageUrl = review.order.listing.images
            ? review.order.listing.images.split(",")[0]
            : null

          return (
            <div key={review.id} className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB] p-6">
              <div className="flex items-start gap-4">
                {review.reviewer.image ? (
                  <Image
                    src={review.reviewer.image}
                    alt={review.reviewer.name || t("common.user")}
                    width={48}
                    height={48}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#E8F4F5] border border-[#E5E7EB] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#111827]">
                      {(review.reviewer.name || review.reviewer.username || "U")[0].toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-[#111827]">
                        {review.reviewer.name || review.reviewer.username || t("common.user")}
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        {new Date(review.createdAt).toLocaleDateString("en-US")}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${
                            star <= review.rating ? "text-yellow-400" : "text-[#E5E7EB]"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-[#6B7280] mb-3">{review.comment}</p>
                  )}

                  <Link
                    href={`/listings/${review.order.listing.id}`}
                    className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#54a3ac] transition-colors"
                  >
                    {imageUrl && (
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-[#E8F4F5] border border-[#E5E7EB]">
                        <Image
                          src={imageUrl}
                          alt={review.order.listing.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <span className="truncate">{t("reviews.forListing")} {review.order.listing.title}</span>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
