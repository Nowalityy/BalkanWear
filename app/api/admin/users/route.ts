import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Liste de tous les utilisateurs (admin)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé. Administrateur requis." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || undefined
    const role = searchParams.get("role") || undefined

    const where: any = {}
    if (role) {
      where.role = role
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        city: true,
        role: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            buyerOrders: true,
            sellerOrders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

// PATCH - Suspendre/Activer un utilisateur (admin)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé. Administrateur requis." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, action } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: "userId et action sont requis" },
        { status: 400 }
      )
    }

    if (action === "suspend") {
      // Pour le MVP, on peut ajouter un champ "suspended" ou utiliser le rôle
      // Pour simplifier, on change le rôle en "SUSPENDED"
      await prisma.user.update({
        where: { id: userId },
        data: { role: "SUSPENDED" },
      })
      return NextResponse.json({ message: "Utilisateur suspendu" })
    } else if (action === "activate") {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "USER" },
      })
      return NextResponse.json({ message: "Utilisateur activé" })
    } else {
      return NextResponse.json(
        { error: "Action invalide" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

