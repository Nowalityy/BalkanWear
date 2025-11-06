"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "@/hooks/useTranslation"

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  isLoading?: boolean
}

export function MessageInput({ onSend, isLoading = false }: MessageInputProps) {
  const { t } = useTranslation()
  const [content, setContent] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isLoading) return

    const messageContent = content.trim()
    setContent("")
    await onSend(messageContent)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-[#E5E7EB] bg-white p-4">
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t("messages.messagePlaceholder")}
          rows={1}
          className="flex-1 px-4 py-2 border border-[#E5E7EB] rounded-[12px] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#54a3ac] focus:border-[#54a3ac] resize-none placeholder:text-[#6B7280] transition-all duration-200 ease-in-out"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !content.trim()}>
          {isLoading ? t("messages.sending") : t("common.submit")}
        </Button>
      </div>
    </form>
  )
}
