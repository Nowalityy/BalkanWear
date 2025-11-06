import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const reviewSchema = z.object({
  orderId: z.string().min(1, "L'ID de commande est requis"),
  rating: z.number().min(1).max(5, "La note doit être entre 1 et 5"),
  comment: z.string().optional(),
})

// GET - Liste des avis d'un utilisateur ou d'une commande
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const orderId = searchParams.get("orderId")

    // Si orderId est fourni, retourner l'avis pour cette commande
    if (orderId) {
      const review = await prisma.review.findUnique({
        where: { orderId },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      })
      return NextResponse.json({ review })
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId est requis" },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: userId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Récupérer les commandes et listings associés
    const reviewsWithOrders = await Promise.all(
      reviews.map(async (review) => {
        const order = await prisma.order.findUnique({
          where: { id: review.orderId },
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        })
        return {
          ...review,
          order: order || null,
        }
      })
    )

    // Calculer la moyenne
    const averageRating =
      reviewsWithOrders.length > 0
        ? reviewsWithOrders.reduce((sum, review) => sum + review.rating, 0) / reviewsWithOrders.length
        : 0

    return NextResponse.json({
      reviews: reviewsWithOrders,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviewsWithOrders.length,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

// POST - Créer un avis
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
    const data = reviewSchema.parse(body)

    // Vérifier que la commande existe et appartient à l'utilisateur
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est l'acheteur ou le vendeur
    const isBuyer = order.buyerId === session.user.id
    const isSeller = order.sellerId === session.user.id

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à laisser un avis pour cette commande" },
        { status: 403 }
      )
    }

    // Vérifier que la commande est livrée
    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "Vous ne pouvez laisser un avis que pour une commande livrée" },
        { status: 400 }
      )
    }

    // Vérifier qu'un avis n'existe pas déjà pour cette commande
    const existingReview = await prisma.review.findUnique({
      where: { orderId: data.orderId },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: "Un avis existe déjà pour cette commande" },
        { status: 400 }
      )
    }

    // Déterminer qui est le reviewer et le reviewee
    const reviewerId = session.user.id
    const revieweeId = isBuyer ? order.sellerId : order.buyerId

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        orderId: data.orderId,
        reviewerId,
        revieweeId,
        rating: data.rating,
        comment: data.comment || null,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    })

    const reviewWithOrder = {
      ...review,
      order: order || null,
    }

    return NextResponse.json(reviewWithOrder, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

