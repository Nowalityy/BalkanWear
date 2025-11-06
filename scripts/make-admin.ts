/**
 * Script pour promouvoir un utilisateur en administrateur
 * Usage: pnpm tsx scripts/make-admin.ts <email>
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error("Usage: pnpm tsx scripts/make-admin.ts <email>")
    process.exit(1)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.error(`Utilisateur avec l'email ${email} non trouvé`)
      process.exit(1)
    }

    if (user.role === "ADMIN") {
      console.log(`L'utilisateur ${email} est déjà administrateur`)
      process.exit(0)
    }

    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    })

    console.log(`✅ ${email} a été promu administrateur avec succès`)
  } catch (error) {
    console.error("Erreur:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

