"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "@/hooks/useTranslation"

interface ReviewFormProps {
  orderId: string
  onSubmit: (rating: number, comment: string) => Promise<void>
  isLoading?: boolean
}

export function ReviewForm({ orderId, onSubmit, isLoading = false }: ReviewFormProps) {
  const { t } = useTranslation()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (rating === 0) {
      setError(t("reviews.selectRating"))
      return
    }

    try {
      await onSubmit(rating, comment)
      setRating(0)
      setComment("")
    } catch (err: any) {
      setError(err.message || t("common.error"))
    }
  }

  const getRatingLabel = (rating: number) => {
    const labels: Record<number, string> = {
      5: t("reviews.excellent"),
      4: t("reviews.veryGood"),
      3: t("reviews.good"),
      2: t("reviews.average"),
      1: t("reviews.poor"),
    }
    return labels[rating] || ""
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-white border border-[#EF4444] text-[#EF4444] px-4 py-3 rounded-[12px]">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          {t("reviews.rating")}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl transition-colors ${
                star <= rating
                  ? "text-yellow-400"
                  : "text-[#E5E7EB] hover:text-yellow-200"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-[#6B7280] mt-1">
            {getRatingLabel(rating)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          {t("reviews.comment")}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-[12px] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#54a3ac] focus:border-[#54a3ac] resize-none placeholder:text-[#6B7280] transition-all duration-200 ease-in-out"
          placeholder={t("reviews.commentPlaceholder")}
        />
      </div>

      <Button type="submit" disabled={isLoading || rating === 0}>
        {isLoading ? t("reviews.submitting") : t("reviews.publishReview")}
      </Button>
    </form>
  )
}
