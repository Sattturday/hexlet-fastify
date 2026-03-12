import fastify from 'fastify'
import pug from 'pug'
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes'
import fastifySession from '@fastify/session'
import formbody from '@fastify/formbody'
import view from '@fastify/view'
import fastifyCookie from '@fastify/cookie'
import fastifyFlash from '@fastify/flash'

import bcrypt from 'bcrypt'
import sqlite3 from 'sqlite3'

import sessionRoutes from './routes/session.js'
import usersRoutes from './routes/users.js'
import coursesRoutes from './routes/courses.js'
import rootRoutes from './routes/root.js'

export const db = new sqlite3.Database(':memory:')

const port = process.env.PORT || 5000

export const state = {
  users: [
    {
      id: 1,
      name: 'First User',
      email: 'first@user.com',
      password: 'password',
    },
    {
      id: 2,
      name: 'Second User',
      email: 'second@user.com',
      password: 'password',
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

const prepareDatabase = async () => {
  const hashedUsers = await Promise.all(
    state.users.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 10),
    }))
  )

  db.serialize(() => {
    db.run(`
      CREATE TABLE courses (
        id INTEGER PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT
      );
    `)

    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255)
      );
    `)

    const stmtCourses = db.prepare('INSERT INTO courses (id, title, description) VALUES (?, ?, ?)')
    state.courses.forEach((course) => {
      stmtCourses.run(course.id, course.title, course.description)
    })
    stmtCourses.finalize()

    const stmtUsers = db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)')
    hashedUsers.forEach((user) => {
      stmtUsers.run(user.id, user.name, user.email, user.password)
    })
    stmtUsers.finalize()
  })
}

prepareDatabase()

export const buildApp = async () => {
  const app = fastify({ exposeHeadRoutes: false })

  await app.register(formbody)
  await app.register(fastifyCookie)

  await app.register(fastifySession, {
    secret: process.env.SESSION_SECRET || 'a-very-long-secret-key-with-32-chars',
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

  app.addHook('preHandler', (req, res, done) => {
    const { userId } = req.session
    if (userId) {
      db.get('SELECT id, name, email FROM users WHERE id = ?', [userId], (error, user) => {
        if (!user) req.session.destroy()
        res.locals = { ...res.locals, currentUser: user || null }
        done()
      })
    } else {
      res.locals = { ...res.locals, currentUser: null }
      done()
    }
  })

  app.addHook('preHandler', (req, res, done) => {
    const { isPublic } = req.routeOptions.config || {}
    if (res.locals.currentUser || isPublic) {
      return done()
    }
    req.flash('error', 'Требуется авторизация')
    return res.redirect(app.reverse('newSession'))
  })

  app.addHook('preHandler', (req, res, done) => {
    res.locals = { ...res.locals, flash: res.flash() }
    done()
  })

  await app.register(sessionRoutes)
  await app.register(rootRoutes)
  await app.register(usersRoutes)
  await app.register(coursesRoutes)

  return app
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = await buildApp()
  app.listen({ port, host: '0.0.0.0' }, () => {
    console.log(`Example app listening on port ${port}`)
  })
}