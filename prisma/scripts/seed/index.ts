import { program } from 'commander'
import { prismaClient } from '../../prisma.server'
import { AdditionalDiscipline, Discipline, Format, Project } from '@prisma/client'
import slugify from 'slugify'
import { fakerDE as faker } from '@faker-js/faker'
import { assert } from '../toolkit'

program
  .name('app:seed')
  .description('Seed database')
  .argument('<number>', 'number of projects to create', (v: string, _: any) => {
    const n = parseInt(v, 10)
    if (isNaN(n)) {
      throw new Error('Argument number must be a number')
    }
    return n
  })
program.parse()

const uniqueArrayElements = <T> (data: Array<T>, min: number, max: number): Array<T> => {
  assert(min < max, 'Min has to be smaller than max')
  assert(max <= data.length, 'Max hast to smaller or equal than length of data')
  const elements: Array<T> = faker.helpers.arrayElements<T>(data, { min: 3, max: 10 })
  return [...new Set(elements.map(e => JSON.stringify(e)))].map((e: string) => JSON.parse(e) as T)
}

const fetchAdditionalDisciplines = async (): Promise<Array<AdditionalDiscipline>> => {
  return await prismaClient.additionalDiscipline.findMany()
}

const fetchDisciplines = async (): Promise<Array<Discipline>> => {
  return await prismaClient.discipline.findMany()
}

const fetchFurtherDisciplines = (): Array<string> => [
  'Mathematik',
  'Informatik',
  'Physik',
  'Chemie',
  'Biologie',
  'Ingenieurwissenschaften',
  'Materialwissenschaften',
  'Geowissenschaften',
  'Astronomie',
  'Statistik',
  'Elektrotechnik',
  'Maschinenbau',
  'Informatiktechnik',
  'Robotik',
  'Umweltwissenschaften',
  'Biotechnologie',
  'Medizintechnik',
  'Nanotechnologie',
  'Erneuerbare Energien',
  'Künstliche Intelligenz',
  'Datenwissenschaft',
  'Cybersicherheit',
  'Operationsforschung',
  'Telekommunikation',
  'Luft- und Raumfahrttechnik',
  'Erdöl- und Erdgastechnik',
  'Verfahrenstechnik',
  'Werkstofftechnik',
  'Angewandte Mathematik',
  'Geoinformatik',
  'Neurobiologie',
  'Quantenphysik',
  'Bioinformatik',
  'Ökologie',
  'Meteorologie',
  'Organische Chemie',
  'Genetik',
  'Robotiktechnik',
  'Wasserressourcenmanagement',
  'Photonik',
  'Theoretische Physik',
  'Astrophysik',
  'Numerische Analyse',
  'Computergrafik',
  'Lebensmitteltechnologie',
  'Molekularbiologie',
  'Bauingenieurwesen',
  'Umwelttechnik'
]

const fetchFormats = async (): Promise<Array<Format>> => {
  return await prismaClient.format.findMany()
}

const fetchFurtherFormats = (): Array<string> => [
  'Forschungsprojekt',
  'Ingenieurprojekt',
  'Programmierprojekt',
  'Robotikprojekt',
  'Experiment',
  'Wettbewerbsprojekt',
  'Umweltprojekt',
  'Innovationsprojekt',
  'Lehrprojekt',
  'Nachhaltigkeitsprojekt',
  'Mathematikmodellierung',
  'Laborprojekt',
  'Informatikprojekt',
  'Elektronikprojekt',
  'Physikprojekt',
  'Biologieprojekt',
  'Chemieprojekt',
  'Raumfahrtprojekt',
  'Forschungsreise',
  'Auslandsexkursion'
]

type CreateProjectType = Omit<Project, 'id'>

const createProject = (
  furtherDisciplines: Array<string>,
  furtherFormats: Array<string>
): CreateProjectType => {
  const name = faker.company.name()

  return {
    name: name,
    slug: `${slugify(name)}-${faker.number.int({ min: 1, max: 999999 })}`,
    subline: faker.lorem.sentence(),
    headline: faker.company.buzzPhrase(),
    excerpt: faker.lorem.sentences(3),
    city: faker.location.city(),
    published: true,
    createdAt: faker.date.between({ from: Date.parse('2020-01-01'), to: Date.now() }),
    updatedAt: faker.date.between({ from: Date.parse('2020-01-01'), to: Date.now() }),
    furtherDisciplines: uniqueArrayElements<string>(furtherDisciplines, 3, 10),
    furtherFormats: uniqueArrayElements<string>(furtherFormats, 3, 10)
  }
}


const main = async (numberOfProjects: number): Promise<void> => {
  try {
    console.log(`Going to create another ${numberOfProjects} projects`)

    console.log(`Fetch reference data`)
    const disciplines: Array<Discipline> = await fetchDisciplines()
    const additionalDisciplines: Array<AdditionalDiscipline> = await fetchAdditionalDisciplines()
    const furtherDisciplines: Array<string> = fetchFurtherDisciplines()
    const formats: Array<Format> = await fetchFormats()
    const furtherFormats: Array<string> = fetchFurtherFormats()


    for (let i = 0; i < numberOfProjects; i++) {
      const project = createProject(furtherDisciplines, furtherFormats)
      await prismaClient.project.create({
        data: {
          ...project,
          formats: {
            create: uniqueArrayElements<Format>(formats, 2, 6).map(d => ({
              format: {
                connect: {
                  id: d.id
                }
              }
            }))
          },
          disciplines: {
            create: uniqueArrayElements<Discipline>(disciplines, 2, 6).map(d => ({
              discipline: {
                connect: {
                  id: d.id
                }
              }
            }))
          },
          additionalDisciplines: {
            create: uniqueArrayElements<AdditionalDiscipline>(additionalDisciplines, 2, 6).map(d => ({
              additionalDiscipline: {
                connect: {
                  id: d.id
                }
              }
            }))
          }
        }
      })
    }
  } finally {
    await prismaClient.$disconnect()
    console.log('Done')
  }
}

main(+program.args[0])
