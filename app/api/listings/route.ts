import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const listingSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères").max(200, "Le titre est trop long"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères").max(5000, "La description est trop longue"),
  price: z.number().positive("Le prix doit être positif").max(999999, "Le prix est trop élevé"),
  category: z.string().min(1, "La catégorie est requise"),
  size: z.string().max(50, "La taille est trop longue").optional().nullable(),
  brand: z.string().max(100, "La marque est trop longue").optional().nullable(),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"], {
    errorMap: () => ({ message: "L'état doit être : Neuf, Comme neuf, Bon état ou État correct" })
  }),
  images: z.string().max(2000, "Les URLs d'images sont trop longues").optional().nullable(),
})

// GET - Liste des annonces avec filtres
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      status: searchParams.get("status") || "ACTIVE",
      category: searchParams.get("category") || undefined,
      size: searchParams.get("size") || undefined,
      brand: searchParams.get("brand") || undefined,
      condition: searchParams.get("condition") || undefined,
      minPrice: searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined,
      search: searchParams.get("search") || undefined,
    }

    const where: any = {
      status: filters.status,
    }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.size) {
      where.size = filters.size
    }

    if (filters.brand) {
      where.brand = { 
        not: null,
        contains: filters.brand 
      }
    }

    if (filters.condition) {
      where.condition = filters.condition
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {}
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice
      }
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
        { 
          brand: { 
            not: null,
            contains: filters.search 
          } 
        },
      ]
    }

    const listings = await prisma.listing.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limite pour le MVP
    })

    return NextResponse.json(listings)
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des annonces" },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle annonce
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
    
    // Convertir le prix en number si c'est une string
    if (typeof body.price === 'string') {
      body.price = parseFloat(body.price)
    }
    
    // Nettoyer les champs optionnels : convertir les chaînes vides en undefined
    if (body.size === "" || body.size === null) {
      delete body.size
    }
    if (body.brand === "" || body.brand === null) {
      delete body.brand
    }
    if (body.images === "" || body.images === null) {
      delete body.images
    }
    
    const data = listingSchema.parse(body)

    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition,
        images: data.images ?? "",
        size: data.size ?? null,
        brand: data.brand ?? null,
        userId: session.user.id,
      },
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

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors)
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating listing:", error)
    const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de la création de l'annonce"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

