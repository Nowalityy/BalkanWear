"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import Link from "next/link"
import { Header } from "@/components/Header"
import { ReviewList } from "@/components/ReviewList"
import { useTranslation } from "@/hooks/useTranslation"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    city: "",
    image: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [reviews, setReviews] = useState<any>(null)
  const [showReviews, setShowReviews] = useState(false)
  const [stats, setStats] = useState({
    listings: 0,
    orders: 0,
    reviews: 0,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user) {
      fetchProfile()
      fetchStats()
    }
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.name || "",
          username: data.username || "",
          city: data.city || "",
          image: data.image || "",
        })

        if (data.id) {
          fetchReviews(data.id)
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
    }
  }

  const fetchStats = async () => {
    try {
      // Récupérer les listings de l'utilisateur
      const listingsRes = await fetch("/api/listings")
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json()
        if (Array.isArray(listingsData) && session?.user?.id) {
          // Filtrer les listings de l'utilisateur connecté
          const userListings = listingsData.filter((listing: any) => listing.user?.id === session.user.id)
          setStats(prev => ({ ...prev, listings: userListings.length }))
        }
      }
      
      // Récupérer les orders de l'utilisateur (buyer + seller)
      const ordersRes = await fetch("/api/orders?role=buyer")
      if (ordersRes.ok) {
        const buyerOrders = await ordersRes.json()
        const buyerCount = Array.isArray(buyerOrders) ? buyerOrders.length : 0
        
        const sellerOrdersRes = await fetch("/api/orders?role=seller")
        if (sellerOrdersRes.ok) {
          const sellerOrders = await sellerOrdersRes.json()
          const sellerCount = Array.isArray(sellerOrders) ? sellerOrders.length : 0
          setStats(prev => ({ ...prev, orders: buyerCount + sellerCount }))
        } else {
          setStats(prev => ({ ...prev, orders: buyerCount }))
        }
      }
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }

  const fetchReviews = async (userId: string) => {
    try {
      const response = await fetch(`/api/reviews?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
        setStats(prev => ({ ...prev, reviews: data.totalReviews || 0 }))
      }
    } catch (err) {
      console.error("Error fetching reviews:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t("common.error"))
      } else {
        setMessage(t("profile.saved"))
        setIsEditing(false)
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (err) {
      setError(t("common.error"))
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F4F5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#E5E7EB] border-t-[#54a3ac] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B7280] font-medium">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const displayName = formData.name || formData.username || session.user?.name || session.user?.email || t("common.user")
  const displayImage = formData.image || session.user?.image
  const initials = (displayName || "U")[0].toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4F5] via-[#F0F9FA] to-[#E8F4F5] pb-20 md:pb-0">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#54a3ac] via-[#4a8f96] to-[#54a3ac] pt-8 pb-12 md:pt-12 md:pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl ring-4 ring-white/20">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={displayName}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#54a3ac] to-[#4a8f96] flex items-center justify-center">
                    <span className="text-5xl md:text-6xl font-bold text-white">{initials}</span>
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {displayName}
              </h1>
              {formData.username && (
                <p className="text-white/80 text-lg mb-1">@{formData.username}</p>
              )}
              {formData.city && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/90 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">{formData.city}</span>
                </div>
              )}
              
              {/* Stats */}
              <div className="flex gap-4 md:gap-6 mt-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 flex-1 md:flex-initial">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stats.listings}</div>
                  <div className="text-white/80 text-sm font-medium">{t("header.announcements")}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 flex-1 md:flex-initial">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stats.orders}</div>
                  <div className="text-white/80 text-sm font-medium">{t("header.orders")}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 flex-1 md:flex-initial">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stats.reviews}</div>
                  <div className="text-white/80 text-sm font-medium">{t("profile.reviews")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Edit Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB]/50 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#111827]">{t("profile.title")}</h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t("profile.edit")}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      fetchProfile()
                    }}
                  >
                    {t("common.cancel")}
                  </Button>
                )}
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-fadeIn">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {message && (
                <div className="mb-6 bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-fadeIn">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {message}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-semibold text-[#111827] mb-2.5">
                      {t("profile.image")} (URL)
                    </label>
                    <Input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/photo.jpg"
                    />
                    {formData.image && (
                      <div className="mt-4 flex justify-center">
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#E5E7EB] shadow-lg">
                          <Image
                            src={formData.image}
                            alt="Preview"
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Input
                    label={t("profile.name")}
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <Input
                    label={t("profile.username")}
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder={t("profile.username")}
                  />

                  <Input
                    label={t("profile.city")}
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Belgrade"
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        fetchProfile()
                      }}
                      className="flex-1"
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit" size="sm" disabled={isLoading} className="flex-1">
                      {isLoading ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t("profile.save")}
                        </span>
                      ) : (
                        t("common.save")
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                      <div className="text-sm font-medium text-[#6B7280] mb-1">{t("profile.name")}</div>
                      <div className="text-base font-semibold text-[#111827]">{formData.name || "-"}</div>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                      <div className="text-sm font-medium text-[#6B7280] mb-1">{t("profile.username")}</div>
                      <div className="text-base font-semibold text-[#111827]">{formData.username || "-"}</div>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB] md:col-span-2">
                      <div className="text-sm font-medium text-[#6B7280] mb-1">{t("profile.city")}</div>
                      <div className="text-base font-semibold text-[#111827]">{formData.city || "-"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB]/50 p-6">
              <h3 className="text-base font-bold text-[#111827] mb-5">{t("profile.quickActions")}</h3>
              <div className="space-y-4">
                <Link href="/listings/new">
                  <Button variant="primary" size="sm" className="w-full justify-center gap-2 py-1.5 text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t("header.sell")}
                  </Button>
                </Link>
                <Link href="/listings">
                  <Button variant="outline" size="sm" className="w-full justify-center gap-2 py-1.5 text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    {t("header.announcements")}
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="outline" size="sm" className="w-full justify-center gap-2 py-1.5 text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {t("header.orders")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews && (
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB]/50 p-6 md:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#111827] mb-1">{t("profile.reviews")}</h2>
                {reviews.totalReviews > 0 && (
                  <p className="text-[#6B7280] text-sm">
                    {reviews.averageRating?.toFixed(1)} ⭐ • {reviews.totalReviews} {t("profile.reviews")}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReviews(!showReviews)}
                className="flex items-center gap-1.5"
              >
                {showReviews ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    {t("profile.hideReviews")}
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {t("profile.showReviews")}
                  </>
                )}
              </Button>
            </div>

            {showReviews && (
              <div className="animate-fadeIn">
                <ReviewList
                  reviews={reviews.reviews || []}
                  averageRating={reviews.averageRating}
                  totalReviews={reviews.totalReviews}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
