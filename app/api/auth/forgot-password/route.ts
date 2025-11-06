import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
    // En production, on enverrait un email avec un token de réinitialisation
    if (user) {
      // TODO: Implémenter l'envoi d'email avec token de réinitialisation
      // Pour l'instant, on retourne juste un succès
    }

    return NextResponse.json({
      message: "Si cet email existe, un lien de réinitialisation a été envoyé",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

