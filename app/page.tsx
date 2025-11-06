"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/Header"
import { useTranslation } from "@/hooks/useTranslation"

export default function Home() {
  const { data: session } = useSession()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero Section - Style Vinted */}
        <section className="pt-8 pb-16 md:pt-16 md:pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#111827] mb-4 leading-tight">
              {t("home.title")}
              <br />
              <span className="text-[#54a3ac]">{t("home.subtitle")}</span>
            </h1>
            <p className="text-lg text-[#6B7280] mb-8 max-w-2xl mx-auto">
              {t("home.description")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {session ? (
                <>
                  <Link href="/listings/new">
                    <Button size="lg" className="w-full sm:w-auto">
                      {t("home.ctaCreate")}
                    </Button>
                  </Link>
                  <Link href="/listings">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      {t("home.ctaBrowse")}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button size="lg" className="w-full sm:w-auto">
                      {t("home.ctaStart")}
                    </Button>
                  </Link>
                  <Link href="/listings">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      {t("home.ctaBrowse")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Simple Features - Style Vinted */}
        <section className="py-16 md:py-24 bg-[#F9FAFB]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#54a3ac]/10 mb-4">
                  <svg className="w-6 h-6 text-[#54a3ac]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">{t("home.feature1Title")}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {t("home.feature1Desc")}
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#54a3ac]/10 mb-4">
                  <svg className="w-6 h-6 text-[#54a3ac]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">{t("home.feature2Title")}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {t("home.feature2Desc")}
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#54a3ac]/10 mb-4">
                  <svg className="w-6 h-6 text-[#54a3ac]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">{t("home.feature3Title")}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {t("home.feature3Desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Simple CTA - Style Vinted */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#111827] mb-4">
              {t("home.ctaTitle")}
            </h2>
            <p className="text-base text-[#6B7280] mb-8 max-w-xl mx-auto">
              {t("home.ctaDescription")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {session ? (
                <Link href="/listings/new">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t("home.ctaCreate")}
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t("home.ctaStart")}
                  </Button>
                </Link>
              )}
              <Link href="/listings">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t("home.ctaBrowse")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
