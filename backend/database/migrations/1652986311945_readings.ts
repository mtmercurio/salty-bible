import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Readings extends BaseSchema {
  protected tableName = 'readings'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.date('date')
      table.string('verses')
      table.string('label')
      table.integer('reading_day_index')
      table.boolean('complete').defaultTo(false)
      table.integer('reading_plan_id').unsigned().references('reading_plans.id').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
