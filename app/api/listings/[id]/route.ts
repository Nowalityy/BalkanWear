import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const listingSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional(),
  category: z.string().optional(),
  size: z.string().optional(),
  brand: z.string().optional(),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]).optional(),
  images: z.string().optional(),
  status: z.enum(["ACTIVE", "SOLD", "DELETED"]).optional(),
})

// GET - Détails d'une annonce
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
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

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json(listing)
  } catch (error) {
    console.error("Error fetching listing:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

// PATCH - Modifier une annonce
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

    // Vérifier que l'annonce existe et appartient à l'utilisateur
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    if (existingListing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier cette annonce" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = listingSchema.parse(body)

    const listing = await prisma.listing.update({
      where: { id },
      data,
      include: {
        user: {
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

    return NextResponse.json(listing)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error updating listing:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une annonce
export async function DELETE(
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

    // Vérifier que l'annonce existe et appartient à l'utilisateur
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    if (existingListing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer cette annonce" },
        { status: 403 }
      )
    }

    // Soft delete : marquer comme DELETED plutôt que supprimer
    await prisma.listing.update({
      where: { id },
      data: { status: "DELETED" },
    })

    return NextResponse.json({ message: "Annonce supprimée avec succès" })
  } catch (error) {
    console.error("Error deleting listing:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

