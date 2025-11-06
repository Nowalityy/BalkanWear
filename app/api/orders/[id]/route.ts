import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "DISPUTED"]).optional(),
  paymentStatus: z.enum(["PENDING", "HELD", "RELEASED", "REFUNDED"]).optional(),
})

// GET - Détails d'une commande
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            images: true,
            price: true,
            category: true,
            size: true,
            brand: true,
            condition: true,
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

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est l'acheteur ou le vendeur
    if (order.buyerId !== session.user.id && order.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à voir cette commande" },
        { status: 403 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour une commande
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const data = updateOrderSchema.parse(body)

    // Vérifier les permissions selon l'action
    const isBuyer = order.buyerId === session.user.id
    const isSeller = order.sellerId === session.user.id

    // Logique de mise à jour selon le rôle
    let updateData: any = {}

    if (data.status) {
      // Seul le vendeur peut marquer comme SHIPPED
      if (data.status === "SHIPPED" && !isSeller) {
        return NextResponse.json(
          { error: "Seul le vendeur peut marquer la commande comme expédiée" },
          { status: 403 }
        )
      }

      // Seul l'acheteur peut marquer comme DELIVERED
      if (data.status === "DELIVERED" && !isBuyer) {
        return NextResponse.json(
          { error: "Seul l'acheteur peut confirmer la réception" },
          { status: 403 }
        )
      }

      updateData.status = data.status

      // Si l'acheteur confirme la réception, libérer les fonds (escrow)
      if (data.status === "DELIVERED") {
        updateData.paymentStatus = "RELEASED"
      }
    }

    if (data.paymentStatus) {
      // Seul le système peut changer le statut de paiement (pour le MVP, on simule)
      // En production, cela serait géré par le PSP
      updateData.paymentStatus = data.paymentStatus
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedOrder)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

