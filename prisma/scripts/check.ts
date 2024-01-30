import { program } from 'commander'
import { prismaClient } from '../prisma.server'

program
  .name('app:check')
  .description('Check database connection with prisma')

program.parse()

async function main (): Promise<void> {
  await prismaClient.$queryRaw`SELECT 1`
  await prismaClient.$disconnect();
}

main()
