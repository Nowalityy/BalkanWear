import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const orderSchema = z.object({
  listingId: z.string().min(1, "L'ID de l'annonce est requis"),
  shippingMethod: z.enum(["STANDARD", "EXPRESS"]),
  shippingAddress: z.string().min(10, "L'adresse de livraison doit contenir au moins 10 caractères"),
})

// GET - Liste des commandes de l'utilisateur
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") || "buyer" // buyer ou seller

    let orders

    if (role === "buyer") {
      orders = await prisma.order.findMany({
        where: {
          buyerId: session.user.id,
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              city: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    } else {
      orders = await prisma.order.findMany({
        where: {
          sellerId: session.user.id,
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              city: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle commande
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = orderSchema.parse(body)

    // Vérifier que l'annonce existe et est disponible
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: {
        user: true,
      },
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Cette annonce n'est plus disponible" },
        { status: 400 }
      )
    }

    if (listing.userId === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas acheter votre propre annonce" },
        { status: 400 }
      )
    }

    // Vérifier qu'il n'y a pas déjà une commande en cours pour cette annonce
    const existingOrder = await prisma.order.findFirst({
      where: {
        listingId: data.listingId,
        buyerId: session.user.id,
        status: {
          in: ["PENDING", "PAID", "SHIPPED"],
        },
      },
    })

    if (existingOrder) {
      return NextResponse.json(
        { error: "Vous avez déjà une commande en cours pour cette annonce" },
        { status: 400 }
      )
    }

    // Calculer le prix total (prix de l'article + frais de livraison)
    const shippingCost = data.shippingMethod === "EXPRESS" ? 5.0 : 2.0
    const totalAmount = listing.price + shippingCost

    // Pour le MVP, on simule le paiement immédiatement
    // En production, cela serait géré par le PSP avec webhooks
    // Créer la commande avec statut PAID et paymentStatus HELD (escrow)
    const order = await prisma.order.create({
      data: {
        listingId: data.listingId,
        buyerId: session.user.id,
        sellerId: listing.userId,
        shippingMethod: data.shippingMethod,
        shippingAddress: data.shippingAddress,
        totalAmount,
        status: "PAID", // Paiement simulé (en production : après confirmation PSP)
        paymentStatus: "HELD", // L'argent est bloqué en escrow jusqu'à réception
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            city: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            city: true,
          },
        },
      },
    })

    // Marquer l'annonce comme vendue
    await prisma.listing.update({
      where: { id: data.listingId },
      data: { status: "SOLD" },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la commande" },
      { status: 500 }
    )
  }
}

