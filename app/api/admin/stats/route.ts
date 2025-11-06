import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Statistiques pour le dashboard admin
export async function GET() {
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

    // Récupérer les statistiques
    const [
      totalUsers,
      totalListings,
      activeListings,
      soldListings,
      totalOrders,
      completedOrders,
      totalRevenue,
      disputes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.listing.count({ where: { status: "SOLD" } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.aggregate({
        where: { paymentStatus: "RELEASED" },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({ where: { status: "DISPUTED" } }),
    ])

    return NextResponse.json({
      users: {
        total: totalUsers,
      },
      listings: {
        total: totalListings,
        active: activeListings,
        sold: soldListings,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
      },
      revenue: {
        total: totalRevenue._sum.totalAmount || 0,
      },
      disputes: disputes,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

