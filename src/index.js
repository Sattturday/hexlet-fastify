import fastify from 'fastify'
import sanitizeHtml from 'sanitize-html'
import view from '@fastify/view'
import pug from 'pug'

const port = 5000

const state = {
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

  // Подключаем pug через плагин
  await app.register(view, { engine: { pug } })

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

  app.get('/users', (req, res) => {
    const { id = '' } = req.query

    const safeId = sanitizeHtml(id, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'escape',
    })

    res.view('src/views/users', { id: safeId })
  })

  return app
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = await buildApp()
  app.listen({ port }, () => {
    console.log(`Example app listening on port ${port}`)
  })
}
