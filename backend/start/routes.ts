/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import HealthCheck from '@ioc:Adonis/Core/HealthCheck'
import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import Reading from 'App/Models/Reading'
import ReadingPlan from 'App/Models/ReadingPlan'
import User from 'App/Models/User'
import PlanImporter from '../data/PlanImport'
import { DateTime } from 'luxon'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.get('/:provider/redirect', async ({ ally, auth, response, params }) => {
  if (await auth.check()) {
    return response.notAcceptable()
  }

  return response.send({ redirectUrl: await ally.use(params.provider).stateless().redirectUrl() })
})

Route.get('/:provider/callback', async ({ ally, auth, response }) => {
  const googleAuth = ally.use('google')

  /**
   * Managing error states here
   */

  /**
   * User has explicitly denied the login request.
   */
  if (googleAuth.accessDenied()) {
    return 'Access was denied'
  }

  /**
   * There was an unknown error during the redirect.
   */
  if (googleAuth.hasError()) {
    return googleAuth.getError()
  }

  const googleUser = await googleAuth.user()

  /**
   * Find the user by email or create
   * a new one
   */
  if (googleUser.email) {
    const user = await User.firstOrCreate(
      {
        email: googleUser.email,
      },
      {
        name: googleUser.name,
      }
    )

    const oat = await auth.use('api').login(user)

    return response.ok(oat.toJSON())
  }
})

Route.get('/authcheck', async ({ auth }) => {
  await auth.use('api').authenticate()
  return { isAuthenticated: auth.use('api').isAuthenticated }
})

Route.post('/logout', async ({ auth }) => {
  await auth.use('api').revoke()
  return {
    revoked: true,
  }
})

Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()

  return report.healthy ? response.ok(report) : response.badRequest(report)
})

Route.get('/user', async ({ auth }) => {
  await auth.use('api').authenticate()
  return auth.use('api').user!.toJSON()
})

Route.get('/user/plan', async ({ auth }) => {
  await auth.use('api').authenticate()
  const user = auth.use('api').user!
  const plan = await ReadingPlan.query().where('user_id', user.id).preload('readings')

  if (!plan) return { status: 'no plan found for user' }
  return plan!.map((p) => p.serialize())
})

Route.get('/user/plan/assign', async ({ auth }) => {
  await auth.use('api').authenticate()

  const importer = new PlanImporter()
  const user = auth.use('api').user!

  const queryPlan = await ReadingPlan.query().where('user_id', user.id)
  if (queryPlan.length > 0) return { status: 'already assigned plan' }

  const plan = await importer.getReadingPlan()
  console.log(plan)
  await user.related('readingPlan').save(plan)
  await user.save()
  return { status: 'plan assigned' }
})

Route.get('/user/plan/status', async ({ auth }) => {
  await auth.use('api').authenticate()
  const user = auth.use('api').user!
  const queryPlan = await ReadingPlan.query().where('user_id', user.id)
  if (queryPlan.length == 0) return { status: 'no plan assigned' }

  const readingPlan = await ReadingPlan.query().whereHas('readings', (query) => {
    query.where('complete', true)
  })
  if (readingPlan.length == 0) return { status: 'not started' }
  return { status: 'in progress' }
})

Route.get('/user/plan/today', async ({ auth }) => {
  await auth.use('api').authenticate()
  const user = auth.use('api').user!
  const queryPlan = await ReadingPlan.query().where('user_id', user.id)
  if (queryPlan.length == 0) return { status: 'no plan assigned' }

  const labels = await Reading.query().where('reading_plan_id', queryPlan[0].id).distinct('label')
  const today = labels!.map(async (label) => {
    const labelValue = label.label
    const reading = await Reading.query()
      .where('reading_plan_id', queryPlan[0].id)
      .where('complete', false)
      .where('label', labelValue)
      .orderBy('reading_day_index', 'asc')
      .first()
    return reading
    // TODO handle all complete
  })
  const readings = await Promise.all(today)
  return readings.map((r) => r?.serialize())
})

Route.post('/readings/:id/toggle-complete', async ({ auth, params }) => {
  await auth.use('api').authenticate()
  const queryReading = await Reading.findByOrFail('id', params.id)
  queryReading.complete = !queryReading.complete
  queryReading.save()
  return queryReading
})
