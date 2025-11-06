"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslation } from "@/hooks/useTranslation"
import { useState } from "react"

interface ListingCardProps {
  id: string
  title: string
  price: number
  images: string
  condition: string
  category: string
  brand?: string | null
  size?: string | null
  user: {
    name?: string | null
    username?: string | null
    city?: string | null
  }
}

export function ListingCard({
  id,
  title,
  price,
  images,
  condition,
  category,
  brand,
  size,
  user,
}: ListingCardProps) {
  const { t } = useTranslation()
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageUrl = images?.split(",")[0] || "/placeholder-clothing.jpg"
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(price)

  return (
    <Link href={`/listings/${id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#E5E7EB] transition-all duration-300 ease-out hover:shadow-xl hover:shadow-[#54a3ac]/10 hover:-translate-y-1 hover:border-[#54a3ac]/30">
        <div className="aspect-square relative bg-gradient-to-br from-[#E8F4F5] to-[#F0F9FA] overflow-hidden">
          {imageUrl ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#E8F4F5] to-[#F0F9FA] animate-pulse" />
              )}
              <Image
                src={imageUrl}
                alt={title}
                fill
                className={`object-cover transition-all duration-500 ease-out group-hover:scale-105 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#9CA3AF]">
              <svg
                className="w-16 h-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[#111827] line-clamp-2 flex-1 text-sm leading-snug group-hover:text-[#54a3ac] transition-colors duration-200">
              {title}
            </h3>
            <span className="text-lg font-bold text-[#54a3ac] flex-shrink-0 whitespace-nowrap">
              {formattedPrice}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {brand && (
              <span className="bg-[#F0F9FA] text-[#54a3ac] px-2.5 py-1 rounded-lg text-xs font-medium border border-[#54a3ac]/20">
                {brand}
              </span>
            )}
            {size && (
              <span className="bg-[#F9FAFB] text-[#6B7280] px-2.5 py-1 rounded-lg text-xs font-medium border border-[#E5E7EB]">
                {t("listings.size")} {size}
              </span>
            )}
            <span className="bg-[#F9FAFB] text-[#6B7280] px-2.5 py-1 rounded-lg text-xs font-medium border border-[#E5E7EB]">
              {t(`listingForm.condition${condition}`)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280] pt-1 border-t border-[#F3F4F6]">
            <span className="font-medium">{user.name || user.username || t("listings.seller")}</span>
            {user.city && (
              <>
                <span className="text-[#D1D5DB]">•</span>
                <span className="text-[#9CA3AF]">{user.city}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
