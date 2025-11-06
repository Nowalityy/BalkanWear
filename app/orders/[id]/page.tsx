"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/Header"
import { OrderStatus } from "@/components/OrderStatus"
import { ReviewForm } from "@/components/ReviewForm"
import { useTranslation } from "@/hooks/useTranslation"

interface Order {
  id: string
  status: string
  paymentStatus: string
  shippingMethod: string
  shippingAddress: string
  totalAmount: number
  createdAt: string
  updatedAt: string
  buyerId: string
  sellerId: string
  listing: {
    id: string
    title: string
    images: string
    price: number
  }
  seller: {
    id: string
    name?: string | null
    username?: string | null
    image?: string | null
    city?: string | null
  }
  buyer: {
    id: string
    name?: string | null
    username?: string | null
    image?: string | null
    city?: string | null
  }
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const { t } = useTranslation()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [hasReview, setHasReview] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchOrder()
      // Rafraîchir toutes les 10 secondes
      const interval = setInterval(fetchOrder, 10000)
      return () => clearInterval(interval)
    }
  }, [orderId, status, router])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("orders.notFound"))
      }

      setOrder(data)

      // Vérifier si un avis existe déjà
      if (data.status === "DELIVERED") {
        try {
          const reviewResponse = await fetch(`/api/reviews?orderId=${orderId}`)
          if (reviewResponse.ok) {
            const reviewData = await reviewResponse.json()
            setHasReview(reviewData.review !== null)
          }
        } catch (err) {
          // Ignorer l'erreur
        }
      }
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true)
    setError("")

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("common.error"))
      }

      setOrder(data)

      // Si la commande est marquée comme livrée, vérifier les avis
      if (newStatus === "DELIVERED") {
        fetchOrder()
      }
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!order) {
      setError(t("orders.notFound"))
      return
    }

    setIsSubmittingReview(true)
    setError("")

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          rating,
          comment: comment || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("common.error"))
      }

      setHasReview(true)
    } catch (err: any) {
      throw err
    } finally {
      setIsSubmittingReview(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#E8F4F5] pb-20 md:pb-0">
        <Header />
        <div className="max-w-4xl mx-auto py-6 md:py-12 px-4 md:px-6">
          <div className="text-center">
            <p className="text-[#6B7280]">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session || !order) {
    return null
  }

  const isBuyer = order.buyerId === session.user.id
  const isSeller = order.sellerId === session.user.id
  const role = isBuyer ? "buyer" : "seller"
  const otherUser = isBuyer ? order.seller : order.buyer

  const imageUrl = order.listing.images ? order.listing.images.split(",")[0] : null
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(order.totalAmount)

  return (
    <div className="min-h-screen bg-[#E8F4F5] pb-20 md:pb-0">
      <Header />
      <div className="max-w-4xl mx-auto py-6 md:py-12 px-4 md:px-6">
        <div className="mb-6">
          <Link href="/orders">
            <Button variant="ghost" size="sm">← {t("orders.backToOrders")}</Button>
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-[#111827] mb-6 md:mb-8">{t("orders.orderDetails")}</h1>

        {error && (
          <div className="bg-white border border-[#EF4444] text-[#EF4444] px-4 py-3 rounded-[12px] mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statut */}
            <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB] p-6">
              <OrderStatus
                status={order.status}
                paymentStatus={order.paymentStatus}
                role={role}
              />
            </div>

            {/* Article */}
            <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB] p-6">
              <h2 className="text-xl font-semibold text-[#111827] mb-4">{t("orders.listingDetails")}</h2>
              <div className="flex gap-4">
                {imageUrl ? (
                  <Link href={`/listings/${order.listing.id}`}>
                    <div className="relative w-24 h-24 rounded-[12px] overflow-hidden bg-[#E8F4F5] border border-[#E5E7EB] flex-shrink-0 cursor-pointer">
                      <Image
                        src={imageUrl}
                        alt={order.listing.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  </Link>
                ) : (
                  <div className="w-24 h-24 bg-[#E8F4F5] border border-[#E5E7EB] rounded-[12px] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#6B7280] text-xs">{t("common.image")}</span>
                  </div>
                )}
                <div className="flex-1">
                  <Link href={`/listings/${order.listing.id}`}>
                    <h3 className="font-semibold text-[#111827] hover:text-[#54a3ac] transition-colors">
                      {order.listing.title}
                    </h3>
                  </Link>
                  <p className="text-[#6B7280] text-sm mt-1">
                    {isBuyer ? t("orders.soldBy") : t("orders.boughtBy")} : {otherUser.name || otherUser.username || t("common.user")}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations de livraison */}
            <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB] p-6">
              <h2 className="text-xl font-semibold text-[#111827] mb-4">{t("orders.shippingInfo")}</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-[#6B7280]">{t("orders.shippingMethod")} :</span>
                  <span className="ml-2 text-[#111827]">
                    {order.shippingMethod === "EXPRESS" ? t("orders.expressShipping") : t("orders.standardShipping")}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-[#6B7280]">{t("orders.shippingAddress")} :</span>
                  <p className="mt-1 text-[#111827]">{order.shippingAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB] p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-[#111827] mb-4">{t("orders.paymentSummary")}</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[#6B7280]">
                  <span>{t("orders.total")}</span>
                  <span className="font-bold text-[#54a3ac]">{formattedTotal}</span>
                </div>
                <div className="text-xs text-[#9CA3AF]">
                  {t("orders.orderDate")} {new Date(order.createdAt).toLocaleDateString("en-US")}
                </div>
              </div>

              {/* Actions selon le rôle et le statut */}
              {isSeller && order.status === "PAID" && (
                <Button
                  className="w-full mb-3"
                  onClick={() => handleUpdateStatus("SHIPPED")}
                  disabled={isUpdating}
                >
                  {isUpdating ? t("common.updating") : t("orders.markAsShipped")}
                </Button>
              )}

              {isBuyer && order.status === "SHIPPED" && (
                <Button
                  className="w-full mb-3"
                  onClick={() => handleUpdateStatus("DELIVERED")}
                  disabled={isUpdating}
                >
                  {isUpdating ? t("common.updating") : t("orders.confirmReceipt")}
                </Button>
              )}

              {order.status === "DELIVERED" && !hasReview && (
                <div className="bg-white border border-[#54a3ac]/50 rounded-[12px] p-4 mb-4">
                  <h3 className="font-semibold text-[#111827] mb-2">{t("orders.reviewOrder")}</h3>
                  <ReviewForm
                    orderId={order.id}
                    onSubmit={handleSubmitReview}
                    isLoading={isSubmittingReview}
                  />
                </div>
              )}

              {hasReview && (
                <div className="bg-white border border-[#10B981]/50 rounded-[12px] p-4 mb-4">
                  <p className="text-sm text-[#10B981]">
                    ✓ {t("orders.reviewLeft")}
                  </p>
                </div>
              )}

              <Link href={`/messages?order=${orderId}`} className="block">
                <Button variant="outline" className="w-full">
                  {t("orders.contact")} {isBuyer ? t("orders.seller") : t("orders.buyer")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
