"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/Button"
import { OrderStatus } from "@/components/OrderStatus"
import { useTranslation } from "@/hooks/useTranslation"

interface Order {
  id: string
  status: string
  paymentStatus: string
  shippingMethod: string
  totalAmount: number
  createdAt: string
  listing: {
    id: string
    title: string
    images: string
    price: number
  }
  seller?: {
    id: string
    name?: string | null
    username?: string | null
    image?: string | null
  }
  buyer?: {
    id: string
    name?: string | null
    username?: string | null
    image?: string | null
  }
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [role, setRole] = useState<"buyer" | "seller">("buyer")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/orders")
      return
    }

    if (status === "authenticated") {
      fetchOrders()
    }
  }, [role, status, router])

  const fetchOrders = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/orders?role=${role}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("common.error"))
      }

      setOrders(data)
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-[#E8F4F5] pb-20 md:pb-0">
        <Header />
        <div className="max-w-6xl mx-auto py-6 md:py-12 px-4 md:px-6">
          <div className="text-center">
            <p className="text-[#6B7280]">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const formattedTotal = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount)

  return (
    <div className="min-h-screen bg-[#E8F4F5] pb-20 md:pb-0">
      <Header />
      <div className="max-w-6xl mx-auto py-6 md:py-12 px-4 md:px-6">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#111827]">{t("orders.title")}</h1>
          <div className="flex gap-2">
            <Button
              variant={role === "buyer" ? "primary" : "outline"}
              size="sm"
              onClick={() => setRole("buyer")}
            >
              {t("orders.myPurchases")}
            </Button>
            <Button
              variant={role === "seller" ? "primary" : "outline"}
              size="sm"
              onClick={() => setRole("seller")}
            >
              {t("orders.mySales")}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-white border border-[#EF4444] text-[#EF4444] px-4 py-3 rounded-[12px] mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB] p-8 md:p-12 text-center">
            <p className="text-[#6B7280] mb-4">
              {role === "buyer"
                ? t("orders.noPurchases")
                : t("orders.noSales")}
            </p>
            <Link href="/listings">
              <Button variant="outline">{t("orders.browseListings")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const imageUrl = order.listing.images
                ? order.listing.images.split(",")[0]
                : null
              const otherUser = role === "buyer" ? order.seller : order.buyer

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-200 ease-in-out p-4 md:p-6 card-hover"
                >
                  <div className="flex gap-4">
                    {imageUrl ? (
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-[12px] overflow-hidden bg-[#E8F4F5] border border-[#E5E7EB] flex-shrink-0">
                        <Image
                          src={imageUrl}
                          alt={order.listing.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-[#E8F4F5] border border-[#E5E7EB] rounded-[12px] flex items-center justify-center flex-shrink-0">
                        <span className="text-[#6B7280] text-xs">{t("common.image")}</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#111827] truncate">
                            {order.listing.title}
                          </h3>
                          <p className="text-sm text-[#6B7280] mt-1">
                            {role === "buyer" ? t("orders.soldBy") : t("orders.boughtBy")} :{" "}
                            {otherUser?.name || otherUser?.username || t("common.user")}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="font-bold text-[#54a3ac]">
                            {formattedTotal(order.totalAmount)}
                          </p>
                          <p className="text-xs text-[#6B7280] mt-1">
                            {new Date(order.createdAt).toLocaleDateString("en-US")}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <OrderStatus
                          status={order.status}
                          paymentStatus={order.paymentStatus}
                          role={role}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
