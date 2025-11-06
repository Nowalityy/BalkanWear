"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import Link from "next/link"
import { useTranslation } from "@/hooks/useTranslation"

export default function SignUpPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordMismatch"))
      return
    }

    if (formData.password.length < 8) {
      setError(t("auth.passwordTooShort"))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t("common.error"))
        return
      }

      // Auto-login après inscription
      try {
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.ok) {
          router.push("/")
          router.refresh()
        } else {
          // Si la connexion automatique échoue, rediriger vers la page de connexion
          setError(t("auth.accountCreated"))
          setTimeout(() => {
            router.push("/auth/signin?email=" + encodeURIComponent(formData.email))
          }, 2000)
        }
      } catch (signInError) {
        // Si la connexion automatique échoue, rediriger vers la page de connexion
        setError(t("auth.accountCreated"))
        setTimeout(() => {
          router.push("/auth/signin?email=" + encodeURIComponent(formData.email))
        }, 2000)
      }
    } catch (err) {
      setError(t("common.error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8F4F5] px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB]">
        <div>
          <h2 className="text-3xl font-semibold text-center text-[#111827]">
            {t("auth.signupTitle")}
          </h2>
          <p className="mt-2 text-center text-sm text-[#6B7280]">
            {t("auth.signupSubtitle")}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-white border border-[#EF4444] text-[#EF4444] px-4 py-3 rounded-[12px]">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label={t("auth.name")}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoComplete="name"
            />
            <Input
              label={t("auth.email")}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />
            <Input
              label={t("auth.password")}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="new-password"
            />
            <Input
              label={t("auth.confirmPassword")}
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t("auth.creating") : t("auth.signupButton")}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#6B7280]">{t("auth.or")}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            {t("auth.loginWithGoogle")}
          </Button>

          <p className="text-center text-sm text-[#6B7280]">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link href="/auth/signin" className="font-medium text-[#54a3ac] hover:underline">
              {t("auth.loginLink")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

