"use client"

import { useTranslation } from "@/hooks/useTranslation"

interface OrderStatusProps {
  status: string
  paymentStatus: string
  role?: "buyer" | "seller"
}

export function OrderStatus({ status, paymentStatus, role = "buyer" }: OrderStatusProps) {
  const { t } = useTranslation()

  const statusLabels: Record<string, string> = {
    PENDING: t("orders.status.pending"),
    PAID: t("orders.status.paid"),
    SHIPPED: t("orders.status.shipped"),
    DELIVERED: t("orders.status.delivered"),
    CANCELLED: t("orders.status.cancelled"),
    DISPUTED: "Disputed",
  }

  const paymentStatusLabels: Record<string, string> = {
    PENDING: t("orders.paymentStatus.pending"),
    HELD: "Held (escrow)",
    RELEASED: t("orders.paymentStatus.released"),
    REFUNDED: "Refunded",
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    DISPUTED: "bg-orange-100 text-orange-800",
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#6B7280]">{t("orders.statusLabel")} :</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
          {statusLabels[status] || status}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#6B7280]">{t("orders.paymentStatusLabel")} :</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          paymentStatus === "HELD" ? "bg-yellow-100 text-yellow-800" :
          paymentStatus === "RELEASED" ? "bg-green-100 text-green-800" :
          paymentStatus === "REFUNDED" ? "bg-red-100 text-red-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {paymentStatusLabels[paymentStatus] || paymentStatus}
        </span>
      </div>
    </div>
  )
}
