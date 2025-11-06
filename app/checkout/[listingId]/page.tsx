"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Header } from "@/components/Header"

interface Listing {
  id: string
  title: string
  description: string
  price: number
  images: string
  user: {
    id: string
    name?: string | null
    username?: string | null
    city?: string | null
  }
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const listingId = params.listingId as string

  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    shippingMethod: "STANDARD" as "STANDARD" | "EXPRESS",
    shippingAddress: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/checkout/${listingId}`)
      return
    }

    if (status === "authenticated") {
      fetchListing()
    }
  }, [listingId, status, router])

  const fetchListing = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/listings/${listingId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Annonce non trouvée")
      }

      // Vérifier que ce n'est pas votre propre annonce
      if (data.user.id === session?.user?.id) {
        router.push(`/listings/${listingId}`)
        return
      }

      // Vérifier que l'annonce est disponible
      if (data.status !== "ACTIVE") {
        setError("Cette annonce n'est plus disponible")
      }

      setListing(data)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsCreating(true)

    if (!formData.shippingAddress.trim() || formData.shippingAddress.length < 10) {
      setError("Veuillez entrer une adresse de livraison valide (minimum 10 caractères)")
      setIsCreating(false)
      return
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          shippingMethod: formData.shippingMethod,
          shippingAddress: formData.shippingAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la commande")
      }

      // Rediriger vers la page de commande
      router.push(`/orders/${data.id}`)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsCreating(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <p className="text-gray-500">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session || !listing) {
    return null
  }

  const imageUrl = listing.images ? listing.images.split(",")[0] : null
  const shippingCost = formData.shippingMethod === "EXPRESS" ? 5.0 : 2.0
  const totalAmount = listing.price + shippingCost
  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(listing.price)
  const formattedShipping = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(shippingCost)
  const formattedTotal = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(totalAmount)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="mb-6">
          <Link href={`/listings/${listingId}`}>
            <Button variant="ghost" size="sm">← Retour à l'annonce</Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finaliser votre commande</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Résumé de la commande */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Article</h2>
              <div className="flex gap-4">
                {imageUrl ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={imageUrl}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400 text-xs">Image</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Vendeur : {listing.user.name || listing.user.username || "Vendeur"}
                    {listing.user.city && ` • ${listing.user.city}`}
                  </p>
                  <p className="text-lg font-bold text-black mt-2">{formattedPrice}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mode de livraison</h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.shippingMethod === "STANDARD"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="STANDARD"
                    checked={formData.shippingMethod === "STANDARD"}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingMethod: e.target.value as "STANDARD" })
                    }
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Livraison standard</div>
                    <div className="text-sm text-gray-500">2-5 jours ouvrés • {formattedShipping}</div>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.shippingMethod === "EXPRESS"
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="EXPRESS"
                    checked={formData.shippingMethod === "EXPRESS"}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingMethod: e.target.value as "EXPRESS" })
                    }
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Livraison express</div>
                    <div className="text-sm text-gray-500">1-2 jours ouvrés • {formattedShipping}</div>
                  </div>
                </label>
              </div>

              <div className="mt-6">
                <Input
                  label="Adresse de livraison *"
                  value={formData.shippingAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingAddress: e.target.value })
                  }
                  placeholder="Rue, numéro, code postal, ville"
                  required
                  rows={3}
                  as="textarea"
                />
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Récapitulatif</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Prix de l'article</span>
                  <span>{formattedPrice}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Frais de livraison</span>
                  <span>{formattedShipping}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-black">
                  <span>Total</span>
                  <span>{formattedTotal}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Paiement sécurisé (Escrow)</strong>
                  <br />
                  Votre paiement sera bloqué jusqu'à réception de la commande. Le vendeur recevra l'argent une fois que vous aurez confirmé la réception.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isCreating || !formData.shippingAddress.trim()}
                >
                  {isCreating ? "Création de la commande..." : "Confirmer la commande"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

