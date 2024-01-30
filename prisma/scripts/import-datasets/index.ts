import disciplines from './data/disciplines.json'
import additionalDisciplines from './data/additionalDisciplines.json'
import formats from './data/formats.json'
import type { GenericEntry, TableName } from './utils'
import { importDataset } from './utils'
import { prismaClient } from '../../prisma.server'

const staticDatasets: Array<{ tableName: TableName; data: GenericEntry[] }> = [
  { tableName: 'discipline', data: disciplines },
  { tableName: 'additionalDiscipline', data: additionalDisciplines },
  { tableName: 'format', data: formats }
]

Promise.all(
  staticDatasets.map(
    (dataset) =>
      new Promise((resolve) => {
        importDataset(dataset.data, dataset.tableName).then(resolve)
      })
  )
)
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prismaClient.$disconnect()
    console.log('done.')
  })
