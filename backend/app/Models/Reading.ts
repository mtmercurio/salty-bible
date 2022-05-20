import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Reading extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.date()
  public date: DateTime

  @column()
  public label: string

  @column()
  public verseStart: string

  @column()
  public verseEnd: string

  @column()
  public complete: boolean

  @column()
  public readingPlanId: number

}
