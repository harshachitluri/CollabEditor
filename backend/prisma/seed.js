const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding demo data...')

  const demoEmail = 'demo@example.com'
  let user = await prisma.user.findUnique({ where: { email: demoEmail } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: demoEmail,
        username: 'demo',
        passwordHash: 'demo',
      },
    })
    console.log('Created demo user', user.id)
  } else {
    console.log('Demo user already exists', user.id)
  }

  const slug = 'demo-room'
  let room = await prisma.room.findUnique({ where: { slug } })
  if (!room) {
    room = await prisma.room.create({
      data: {
        slug,
        name: 'Demo Room',
        language: 'javascript',
        isPublic: true,
        ownerId: user.id,
      },
    })
    console.log('Created demo room', room.id)
  } else {
    console.log('Demo room already exists', room.id)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
