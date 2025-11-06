"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ListingForm } from "@/components/ListingForm"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/Header"
import { useTranslation } from "@/hooks/useTranslation"

export default function NewListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/listings/new")
    }
  }, [status, router])

  const handleSubmit = async (formData: any) => {
    try {
      // S'assurer que le prix est un nombre
      const price = typeof formData.price === 'string' 
        ? parseFloat(formData.price) 
        : formData.price

      // Préparer les données en filtrant les chaînes vides
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: price,
        category: formData.category,
        condition: formData.condition,
      }

      // Ajouter les champs optionnels seulement s'ils ne sont pas vides
      if (formData.size && formData.size.trim()) {
        payload.size = formData.size.trim()
      }
      if (formData.brand && formData.brand.trim()) {
        payload.brand = formData.brand.trim()
      }
      if (formData.images && formData.images.trim()) {
        payload.images = formData.images.trim()
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("common.error"))
      }

      router.push(`/listings/${data.id}`)
    } catch (error: any) {
      throw error
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F4F5]">
        <p className="text-[#6B7280]">{t("common.loading")}</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#E8F4F5] pb-20 md:pb-0">
      <Header />
      <div className="max-w-3xl mx-auto py-6 md:py-12 px-4 md:px-6">
        <div className="mb-6">
          <Link href="/listings">
            <Button variant="ghost" size="sm">← {t("listings.backToList")}</Button>
          </Link>
        </div>

        <div className="bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E5E7EB] p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#111827] mb-6 md:mb-8">
            {t("listings.createNew")}
          </h1>
          <ListingForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}
