"use client"

import { signIn } from "next-auth/react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import Link from "next/link"
import { useTranslation } from "@/hooks/useTranslation"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error === "CredentialsSignin" 
          ? t("auth.invalidCredentials") 
          : result.error)
      } else if (result?.ok) {
        // Attendre un peu pour que la session soit mise à jour
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push("/")
        router.refresh()
      } else {
        setError(t("auth.signInError"))
      }
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message || t("common.error"))
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
            {t("auth.loginTitle")}
          </h2>
          <p className="mt-2 text-center text-sm text-[#6B7280]">
            {t("auth.loginSubtitle")}
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
              label={t("auth.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label={t("auth.password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-[#6B7280] hover:text-[#54a3ac] transition-colors"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
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
            {t("auth.noAccount")}{" "}
            <Link href="/auth/signup" className="font-medium text-[#54a3ac] hover:underline">
              {t("auth.signupLink")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#E8F4F5]">
        <p className="text-[#6B7280]">Loading...</p>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}

