import { program } from 'commander'
import { Project } from '@prisma/client'
import { prismaClient } from '../../prisma.server'

program
  .name('app:vector')
  .description('Init vector by related data')

program.parse()

const fetchProjects = async (): Promise<Array<Project>> => {
  return prismaClient.project.findMany({
    include: {
      formats: true,
      disciplines: true,
      additionalDisciplines: true
    }
  })
}

type ExtendedProjects = ReturnType<typeof fetchProjects>

const prefixArray = (data: Array<string>, prefix: string): Array<string> => {
  return data.map((e: string) => `${prefix}:${e}`)
}

const createVectorArray = (p: Project): Array<string> => {
  const v: Array<string> = []

  return [
    ...prefixArray(p.furtherDisciplines, 'fd'),
    ...prefixArray(p.furtherFormats, 'ff')
  ]
}

const createVectorString = (data: Array<string>): string => {
  return `{"${data.join('","')}"}`
}

const main = async (): Promise<void> => {
  const projects = await fetchProjects()
  for (const p of projects) {
    const vector = createVectorString(createVectorArray(p))
    const str = 'update projects set tsv = array_to_tsvector(\'' + vector + '\') where id = \'' + p.id + '\''
    try {
      await prismaClient.$queryRawUnsafe(str)
    } catch (e) {
      console.error('error on ', { str })
    }
  }
}

main()
