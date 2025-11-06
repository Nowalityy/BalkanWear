"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
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
}

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const { data: session } = useSession()
  const { t } = useTranslation()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#E8F4F5]">
      {messages.length === 0 ? (
        <div className="text-center text-[#6B7280] py-8">
          <p>{t("messages.noMessages")}</p>
          <p className="text-sm mt-2">{t("messages.sendFirst")}</p>
        </div>
      ) : (
        messages.map((message) => {
          const isOwn = message.senderId === session?.user?.id

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
            >
              {!isOwn && (
                <div className="flex-shrink-0">
                  {message.sender.image ? (
                    <Image
                      src={message.sender.image}
                      alt={message.sender.name || t("messages.user")}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center">
                      <span className="text-[#111827] text-sm">
                        {(message.sender.name || message.sender.username || "U")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                {!isOwn && (
                  <span className="text-xs text-[#6B7280] mb-1">
                    {message.sender.name || message.sender.username || t("messages.user")}
                  </span>
                )}
                <div
                  className={`rounded-[12px] px-4 py-2 ${
                    isOwn
                      ? "bg-[#54a3ac] text-white"
                      : "bg-white text-[#111827] border border-[#E5E7EB] shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
                <span className="text-xs text-[#9CA3AF] mt-1">
                  {formatTime(message.createdAt)}
                </span>
              </div>
            </div>
          )
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
