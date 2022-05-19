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
import User from 'App/Models/User'

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
    const user = await User.firstOrCreate({
      email: googleUser.email,
    }, {
      name: googleUser.name,
    })
  
    const oat = await auth.use('api').login(user)

    return response.ok(oat.toJSON())
  }
  

})

Route.get('/authcheck', async ({ auth }) => { 
  await auth.use('api').authenticate()
  return {'isAuthenticated' : auth.use('api').isAuthenticated }
})

Route.post('/logout', async ({ auth }) => {
  await auth.use('api').revoke()
  return {
    revoked: true
  }
})

Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()

  return report.healthy
    ? response.ok(report)
    : response.badRequest(report)
})