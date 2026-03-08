import fastify from 'fastify'
import sanitizeHtml from 'sanitize-html'
import formbody from '@fastify/formbody'
import view from '@fastify/view'
import pug from 'pug'

const port = 5000

const state = {
  users: [],
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

const parseCourseId = (rawId) => {
  if (!/^\d+$/.test(rawId)) {
    return null
  }

  const id = Number(rawId)

  return Number.isSafeInteger(id) ? id : null
}

export const buildApp = async () => {
  const app = fastify()

  // подключаем плагины 
  await app.register(view, { engine: { pug } })
  await app.register(formbody)

  // Маршрут для главной страницы
  app.get('/', (req, res) => {
    res.view('src/views/index')
  })

  // Маршрут для списка курсов (уже есть в вашем коде)
  app.get('/courses', (req, res) => {
    const term = req.query.term || ''
    const normalizedTerm = term.toLowerCase()

    const courses = state.courses.filter((course) => {
      const titleMatch = course.title.toLowerCase().includes(normalizedTerm)
      const descriptionMatch = course.description.toLowerCase().includes(normalizedTerm)

      return titleMatch || descriptionMatch
    })

    const data = {
      term,
      courses,
    }

    res.view('src/views/courses/index', data)
  })

  // Маршрут для отдельного курса (уже есть в вашем коде)
  app.get('/courses/:id', (req, res) => {
    const courseId = parseCourseId(req.params.id)

    if (courseId === null) {
      res.code(400).send({ message: 'Course id must be a positive integer' })
      return
    }

    const course = state.courses.find(({ id }) => id === courseId)

    if (!course) {
      res.code(404).send({ message: 'Course not found' })
      return
    }

    const data = {
      course,
    }
    res.view('src/views/courses/show', data)
  })

  app.get('/courses/new', (req, res) => {
    res.view('src/views/courses/new')
  })

  app.post('/courses', (req, res) => {
    const course = {
      id: state.courses.length + 1,
      title: req.body.title.trim(),
      description: req.body.description.trim(),
    }

    state.courses.push(course)

    res.redirect('/courses')
  })

  app.get('/users', (req, res) => {
    res.view('src/views/users/index', {
      users: state.users,
    })
  })

  app.post('/users', (req, res) => {
    const user = {
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      password: req.body.password,
    }

    state.users.push(user)

    res.redirect('/users')
  })

  app.get('/users/new', (req, res) => {
    res.view('src/views/users/new')
  })

  return app
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = await buildApp()
  app.listen({ port }, () => {
    console.log(`Example app listening on port ${port}`)
  })
}
