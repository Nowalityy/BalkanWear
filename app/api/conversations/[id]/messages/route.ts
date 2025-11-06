import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const messageSchema = z.object({
  content: z.string().min(1, "Le message ne peut pas être vide"),
})

// GET - Récupérer les messages d'une conversation
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

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      )
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à voir cette conversation" },
        { status: 403 }
      )
    }

    // Récupérer les messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId: id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Marquer les messages comme lus
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: session.user.id },
        read: false,
      },
      data: {
        read: true,
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

// POST - Envoyer un message
export async function POST(
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

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: true,
        listing: true,
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      )
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à envoyer un message dans cette conversation" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = messageSchema.parse(body)

    // Créer le message
    const message = await prisma.message.create({
      data: {
        content: data.content,
        conversationId: id,
        senderId: session.user.id,
        listingId: conversation.listingId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
      },
    })

    // Mettre à jour la date de modification de la conversation
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating message:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

