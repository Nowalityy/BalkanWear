"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "@/hooks/useTranslation"

interface Conversation {
  id: string
  listing: {
    id: string
    title: string
    price: number
    images: string
  }
  otherParticipant: {
    id: string
    name?: string | null
    username?: string | null
    image?: string | null
  } | null
  lastMessage: {
    id: string
    content: string
    senderId: string
    sender: {
      id: string
      name?: string | null
      username?: string | null
    }
    createdAt: string
    read: boolean
  } | null
  updatedAt: string
  unreadCount: number
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/messages")
      return
    }

    if (status === "authenticated") {
      fetchConversations()
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(fetchConversations, 30000)
      return () => clearInterval(interval)
    }
  }, [status, router])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("common.error"))
      }

      setConversations(data)
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return t("messages.justNow")
    if (minutes < 60) return t("messages.minutesAgo", { count: minutes })
    if (hours < 24) return t("messages.hoursAgo", { count: hours })
    if (days < 7) return t("messages.daysAgo", { count: days })
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    })
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

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#E8F4F5] pb-20 md:pb-0">
      <Header />
      <div className="max-w-4xl mx-auto py-6 md:py-8 px-4 md:px-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#111827] mb-6">{t("messages.title")}</h1>

        {error && (
          <div className="bg-white border border-[#EF4444] text-[#EF4444] px-4 py-3 rounded-[12px] mb-6">
            {error}
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB] p-8 md:p-12 text-center">
            <p className="text-[#6B7280] mb-4">{t("messages.noConversations")}</p>
            <Link href="/listings">
              <Button variant="outline">{t("messages.browseAds")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const imageUrl = conversation.listing.images
                ? conversation.listing.images.split(",")[0]
                : null
              const formattedPrice = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "EUR",
              }).format(conversation.listing.price)

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className="block bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-200 ease-in-out p-4 card-hover"
                >
                  <div className="flex gap-4">
                    {imageUrl ? (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-[12px] overflow-hidden bg-[#E8F4F5] border border-[#E5E7EB]">
                        <Image
                          src={imageUrl}
                          alt={conversation.listing.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex-shrink-0 rounded-[12px] bg-[#E8F4F5] border border-[#E5E7EB] flex items-center justify-center">
                        <span className="text-[#6B7280] text-xs">{t("common.image")}</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#111827] truncate">
                            {conversation.listing.title}
                          </h3>
                          <p className="text-sm text-[#6B7280]">
                            {conversation.otherParticipant?.name ||
                              conversation.otherParticipant?.username ||
                              t("messages.user")}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm font-medium text-[#54a3ac]">
                            {formattedPrice}
                          </p>
                          {conversation.lastMessage && (
                            <p className="text-xs text-[#6B7280]">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>

                      {conversation.lastMessage && (
                        <p className="text-sm text-[#6B7280] truncate">
                          {conversation.lastMessage.senderId === session.user.id
                            ? t("messages.you")
                            : ""}
                          {conversation.lastMessage.content}
                        </p>
                      )}
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
