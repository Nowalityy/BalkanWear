"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useTranslation } from "@/hooks/useTranslation"

interface FilterBarProps {
  onFilterChange: (filters: FilterValues) => void
}

export interface FilterValues {
  category?: string
  size?: string
  brand?: string
  condition?: string
  minPrice?: string
  maxPrice?: string
  search?: string
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

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<FilterValues>({})
  const [isOpen, setIsOpen] = useState(false)

  const conditions = [
    { value: "NEW", label: t("listingForm.conditionNEW") },
    { value: "LIKE_NEW", label: t("listingForm.conditionLIKE_NEW") },
    { value: "GOOD", label: t("listingForm.conditionGOOD") },
    { value: "FAIR", label: t("listingForm.conditionFAIR") },
  ]

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  const hasActiveFilters = Object.values(filters).some((v) => v)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB]/50 p-5 md:p-6 mb-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg text-[#111827]">{t("filters.title")}</h3>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-[#6B7280] hover:text-[#EF4444]"
            >
              {t("filters.reset")}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2"
          >
            {isOpen ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {t("filters.hide")}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {t("filters.show")}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mb-5">
        <Input
          label={t("filters.search")}
          type="text"
          value={filters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          placeholder={t("filters.searchPlaceholder")}
        />
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2.5">
              {t("filters.category")}
            </label>
            <select
              value={filters.category || ""}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-[#E5E7EB] rounded-xl bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#54a3ac]/20 focus:border-[#54a3ac] transition-all duration-200 ease-out hover:border-[#D1E7E9] cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236B7280%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10"
            >
              <option value="">{t("filters.allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2.5">
              {t("filters.condition")}
            </label>
            <select
              value={filters.condition || ""}
              onChange={(e) => handleFilterChange("condition", e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-[#E5E7EB] rounded-xl bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#54a3ac]/20 focus:border-[#54a3ac] transition-all duration-200 ease-out hover:border-[#D1E7E9] cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236B7280%22 stroke-width=%222%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10"
            >
              <option value="">{t("filters.allConditions")}</option>
              {conditions.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2.5">
              {t("filters.size")}
            </label>
            <Input
              type="text"
              value={filters.size || ""}
              onChange={(e) => handleFilterChange("size", e.target.value)}
              placeholder="Ex: M, 42"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2.5">
              {t("filters.brand")}
            </label>
            <Input
              type="text"
              value={filters.brand || ""}
              onChange={(e) => handleFilterChange("brand", e.target.value)}
              placeholder="Ex: Zara, Nike"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2.5">
              {t("filters.minPrice")}
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={filters.minPrice || ""}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2.5">
              {t("filters.maxPrice")}
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={filters.maxPrice || ""}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
