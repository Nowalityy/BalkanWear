"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import Link from "next/link"
import { useTranslation } from "@/hooks/useTranslation"

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t("common.error"))
      } else {
        setMessage(t("auth.emailSent"))
      }
    } catch (err) {
      setError(t("common.error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8F4F5] px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB]">
        <div>
          <h2 className="text-3xl font-semibold text-center text-[#111827]">
            {t("auth.forgotPasswordTitle")}
          </h2>
          <p className="mt-2 text-center text-sm text-[#6B7280]">
            {t("auth.forgotPasswordInstructions")}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-white border border-[#EF4444] text-[#EF4444] px-4 py-3 rounded-[12px]">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-white border border-[#10B981] text-[#10B981] px-4 py-3 rounded-[12px]">
              {message}
            </div>
          )}

          <Input
            label={t("auth.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t("auth.sending") : t("auth.sendResetLink")}
          </Button>

          <p className="text-center text-sm text-[#6B7280]">
            <Link href="/auth/signin" className="font-medium text-[#54a3ac] hover:underline">
              {t("auth.backToLogin")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

