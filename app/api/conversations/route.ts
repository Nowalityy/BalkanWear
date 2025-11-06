import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Liste des conversations de l'utilisateur
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Formater les conversations pour inclure l'autre participant
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p.user.id !== session.user.id
      )
      const lastMessage = conv.messages[0] || null

      return {
        id: conv.id,
        listing: conv.listing,
        otherParticipant: otherParticipant?.user || null,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              sender: lastMessage.sender,
              createdAt: lastMessage.createdAt,
              read: lastMessage.read,
            }
          : null,
        updatedAt: conv.updatedAt,
        unreadCount: 0, // À calculer si nécessaire
      }
    })

    return NextResponse.json(formattedConversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle conversation
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
    const { listingId, sellerId } = body

    if (!listingId || !sellerId) {
      return NextResponse.json(
        { error: "listingId et sellerId sont requis" },
        { status: 400 }
      )
    }

    // Vérifier si une conversation existe déjà pour ce listing avec ces deux participants
    const existingConversations = await prisma.conversation.findMany({
      where: {
        listingId,
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: true,
      },
    })

    // Trouver la conversation qui contient les deux participants
    const existingConversation = existingConversations.find((conv) => {
      const participantIds = conv.participants.map((p) => p.userId)
      return (
        participantIds.includes(session.user.id) &&
        participantIds.includes(sellerId)
      )
    })

    if (existingConversation) {
      // Retourner la conversation avec toutes les infos
      const fullConversation = await prisma.conversation.findUnique({
        where: { id: existingConversation.id },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
            },
          },
        },
      })
      return NextResponse.json(fullConversation)
    }

    // Créer une nouvelle conversation
    const conversation = await prisma.conversation.create({
      data: {
        listingId,
        participants: {
          create: [
            { userId: session.user.id },
            { userId: sellerId },
          ],
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

