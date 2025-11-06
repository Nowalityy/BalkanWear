"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useTranslation } from "@/hooks/useTranslation"

interface ListingFormData {
  title: string
  description: string
  price: string
  category: string
  size: string
  brand: string
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR"
  images: string
}

interface ListingFormProps {
  initialData?: Partial<ListingFormData>
  onSubmit: (data: ListingFormData) => Promise<void>
  isLoading?: boolean
}

const categories = [
  "Vêtements",
  "Chaussures",
  "Accessoires",
  "Sacs",
  "Bijoux",
  "Montres",
  "Autre",
]

const conditions = [
  { value: "NEW" },
  { value: "LIKE_NEW" },
  { value: "GOOD" },
  { value: "FAIR" },
]

export function ListingForm({
  initialData,
  onSubmit,
  isLoading = false,
}: ListingFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<ListingFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    category: initialData?.category || "",
    size: initialData?.size || "",
    brand: initialData?.brand || "",
    condition: initialData?.condition || "GOOD",
    images: initialData?.images || "",
  })

  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      setError(t("listingForm.requiredFields"))
      return
    }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      setError(t("listingForm.invalidPrice"))
      return
    }

    try {
      await onSubmit(formData)
    } catch (err: any) {
      setError(err.message || t("common.error"))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-white border border-[#EF4444] text-[#EF4444] px-4 py-3 rounded-[12px]">
          {error}
        </div>
      )}

      <Input
        label={t("listingForm.title")}
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        placeholder={t("listingForm.titlePlaceholder")}
      />

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          {t("listingForm.description")}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={5}
          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[12px] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#54a3ac] focus:border-[#54a3ac] transition-all duration-200 ease-in-out placeholder:text-[#6B7280] resize-none"
          placeholder={t("listingForm.descriptionPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t("listingForm.price")}
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-[#111827] mb-2">
            {t("listingForm.category")}
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[12px] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#54a3ac] focus:border-[#54a3ac] transition-all duration-200 ease-in-out appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">{t("listingForm.categoryPlaceholder")}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t("listingForm.size")}
          value={formData.size}
          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          placeholder={t("listingForm.sizePlaceholder")}
        />

        <Input
          label={t("listingForm.brand")}
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          placeholder={t("listingForm.brandPlaceholder")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          {t("listingForm.condition")}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {conditions.map((cond) => (
            <label
              key={cond.value}
              className={`flex items-center p-4 border-2 rounded-[12px] cursor-pointer transition-all duration-200 ease-in-out ${
                formData.condition === cond.value
                  ? "border-[#54a3ac] bg-[#E8F4F5] shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  : "border-[#E5E7EB] bg-white hover:border-[#54a3ac] hover:bg-[#E8F4F5]"
              }`}
            >
              <input
                type="radio"
                name="condition"
                value={cond.value}
                checked={formData.condition === cond.value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    condition: e.target.value as ListingFormData["condition"],
                  })
                }
                className="mr-3 w-4 h-4 accent-[#54a3ac] cursor-pointer"
              />
              <span className="text-[#111827] font-medium text-sm">{t(`listingForm.condition${cond.value}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#111827] mb-2">
          {t("listingForm.images")}
        </label>
        <Input
          type="text"
          value={formData.images}
          onChange={(e) => setFormData({ ...formData, images: e.target.value })}
          placeholder={t("listingForm.imagesPlaceholder")}
        />
        <p className="mt-2 text-sm text-[#6B7280]">
          {t("listingForm.imagesHelp")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-[#E5E7EB]">
        <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto">
          {isLoading ? t("listingForm.saving") : t("listingForm.publish")}
        </Button>
      </div>
    </form>
  )
}
