import fastify from 'fastify'
import pug from 'pug'
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes'
import fastifySession from '@fastify/session'
import formbody from '@fastify/formbody'
import view from '@fastify/view'
import fastifyCookie from '@fastify/cookie'
import fastifyFlash from '@fastify/flash'

import sessionRoutes from './routes/session.js'
import usersRoutes from './routes/users.js'
import coursesRoutes from './routes/courses.js'
import rootRoutes from './routes/root.js'

const port = 5000

export const state = {
  users: [
    {
      id: 1,
      name: 'First User',
      email: 'first@user.com',
    },
    {
      id: 2,
      name: 'Second User',
      email: 'second@user.com',
    },
  ],
  courses: [
    {
      id: 1,
      title: 'JS: Массивы',
      description: 'Курс про массивы в JavaScript',
    },
    {
      id: 2,
      title: 'JS: Функции',
      description: 'Курс про функции в JavaScript',
    },
  ],
}

export const buildApp = async () => {
  const app = fastify({ exposeHeadRoutes: false })

  await app.register(formbody)
  await app.register(fastifyCookie)

  await app.register(fastifySession, {
    secret: 'a-very-long-secret-key-with-32-chars',
    cookie: { secure: false },
  })

  await app.register(fastifyFlash)

  await app.register(fastifyReverseRoutes)

  const route = (name, params = {}) => app.reverse(name, params)

  await app.register(view, {
    engine: { pug },
    root: 'src/views',
    defaultContext: { route },
  })

  await app.register(sessionRoutes)
  await app.register(rootRoutes)
  await app.register(usersRoutes)
  await app.register(coursesRoutes)

  return app
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = await buildApp()
  app.listen({ port }, () => {
    console.log(`Example app listening on port ${port}`)
  })
}