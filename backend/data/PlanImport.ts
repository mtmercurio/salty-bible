import * as fs from 'fs'
import * as path from 'path'
import * as csv from 'fast-csv'
import { DateTime } from 'luxon'
import Reading from 'App/Models/Reading'
import ReadingPlan from 'App/Models/ReadingPlan'

export default class PlanImporter {
  public getReadingPlan = async () => {
    return new Promise<ReadingPlan>(function (resolve, reject) {
      const readings: Reading[] = []
      const plan = new ReadingPlan()
      plan.name = 'Navigators Reading Plan'
      fs.createReadStream(path.resolve(__dirname, '.', 'navigators.csv'))
        .pipe(csv.parse({ headers: true }))
        .on('error', (error) => reject(error))
        .on('data', async (row) => {
          const date = new Date(Date.parse(row.date))
          const label = row.label
          const verses = row.verses
          const readingDayIndex = row.reading_day_index

          const reading = new Reading()
          reading.complete = false
          reading.label = label
          reading.verses = verses
          reading.date = DateTime.fromJSDate(date)
          reading.readingDayIndex = readingDayIndex
          await reading.save()
          readings.push(reading)
        })
        .on('end', async (rowCount: number) => {
          console.log(`Parsed ${rowCount} rows`)
          await plan.related('readings').saveMany(readings)
          await plan.save()
          return resolve(plan)
        })
    })
  }
}
