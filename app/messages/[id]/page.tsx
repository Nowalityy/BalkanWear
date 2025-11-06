"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/Header"
import { MessageList } from "@/components/MessageList"
import { MessageInput } from "@/components/MessageInput"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "@/hooks/useTranslation"

interface Message {
  id: string
  content: string
  senderId: string
  sender: {
    id: string
    name?: string | null
    username?: string | null
    image?: string | null
  }
  createdAt: string
  read: boolean
  listing?: {
    id: string
    title: string
    price: number
    images: string
  } | null
}

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
}

export default function ConversationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string
  const { t } = useTranslation()

  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchConversation()
      fetchMessages()
      // Rafraîchir les messages toutes les 5 secondes
      const interval = setInterval(fetchMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [conversationId, status, router])

  const fetchConversation = async () => {
    try {
      const response = await fetch("/api/conversations")
      const data = await response.json()

      if (response.ok) {
        const conv = data.find((c: any) => c.id === conversationId)
        if (conv) {
          setConversation({
            id: conv.id,
            listing: conv.listing,
            otherParticipant: conv.otherParticipant,
          })
        }
      }
    } catch (err) {
      console.error("Error fetching conversation:", err)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("common.error"))
      }

      setMessages(data)

      // Récupérer les infos de la conversation depuis le premier message ou créer un objet
      if (data.length > 0 && !conversation) {
        // On peut extraire les infos depuis les messages ou faire un appel séparé
        // Pour simplifier, on va utiliser les données du listing dans les messages
      }
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    setIsSending(true)
    setError("")

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("common.error"))
      }

      // Ajouter le nouveau message à la liste
      setMessages((prev) => [...prev, data])
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setIsSending(false)
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

  if (!session) {
    return null
  }

  // Utiliser les infos de la conversation ou extraire depuis les messages
  const listingInfo = conversation?.listing || messages.find(m => m.listing)?.listing || null
  const otherParticipant = conversation?.otherParticipant || messages.find(
    (m) => m.senderId !== session.user.id
  )?.sender || null

  return (
    <div className="min-h-screen bg-[#E8F4F5] pb-20 md:pb-0 flex flex-col">
      <Header />
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
        {/* Header de la conversation */}
        <div className="bg-white border-b border-[#E5E7EB] px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <Link href="/messages">
              <Button variant="ghost" size="sm">← {t("messages.backToMessages")}</Button>
            </Link>
            {listingInfo && (
              <Link
                href={`/listings/${listingInfo.id}`}
                className="flex items-center gap-3 flex-1 ml-4"
              >
                {listingInfo.images && (
                  <div className="relative w-12 h-12 rounded-[12px] overflow-hidden bg-[#E8F4F5] border border-[#E5E7EB]">
                    <Image
                      src={listingInfo.images.split(",")[0]}
                      alt={listingInfo.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-[#111827] truncate">
                    {listingInfo.title}
                  </h2>
                  <p className="text-sm text-[#54a3ac]">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "EUR",
                    }).format(listingInfo.price)}
                  </p>
                </div>
              </Link>
            )}
            {otherParticipant && (
              <div className="flex items-center gap-2 ml-4">
                {otherParticipant.image ? (
                  <Image
                    src={otherParticipant.image}
                    alt={otherParticipant.name || t("messages.user")}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-[#E8F4F5] border border-[#E5E7EB] rounded-full flex items-center justify-center">
                    <span className="text-[#111827] text-xs">
                      {(otherParticipant.name || otherParticipant.username || "U")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm text-[#111827]">
                  {otherParticipant.name || otherParticipant.username || t("messages.user")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          {error && (
            <div className="bg-white border-b border-[#EF4444] text-[#EF4444] px-4 py-2 text-sm">
              {error}
            </div>
          )}
          <MessageList messages={messages} />
        </div>

        {/* Input */}
        <MessageInput onSend={handleSendMessage} isLoading={isSending} />
      </div>
    </div>
  )
}
