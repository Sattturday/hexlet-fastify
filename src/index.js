import fastify from 'fastify'
import * as yup from 'yup'
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

  app.post('/courses', {
    attachValidation: true,
    schema: {
      body: yup.object({
        title: yup.string().min(2, 'Title must contain at least 2 characters'),
        description: yup.string().min(10, 'Description must contain at least 10 characters'),
      }),
    },
    validatorCompiler: ({ schema }) => (data) => {
      try {
        const result = schema.validateSync(data)
        return { value: result }
      }
      catch (e) {
        return { error: e }
      }
    },
  }, (req, res) => {
    const { title, description } = req.body

    if (req.validationError) {
      res.view('src/views/courses/new', {
        title,
        description,
        error: req.validationError,
      })
      return
    }

    const course = {
      id: state.courses.length + 1,
      title: title.trim(),
      description: description.trim(),
    }

    state.courses.push(course)

    res.redirect('/courses')
  })

  app.get('/users', (req, res) => {
    res.view('src/views/users/index', {
      users: state.users,
    })
  })

  app.post('/users', {
    attachValidation: true,
    schema: {
      body: yup.object({
        name: yup.string().min(2, 'Name must contain at least 2 characters'),
        email: yup.string().email('Invalid email'),
        password: yup.string().min(5, 'Password must contain at least 5 characters'),
        passwordConfirmation: yup.string().min(5),
      }),
    },
    validatorCompiler: ({ schema }) => (data) => {
      if (data.password !== data.passwordConfirmation) {
        return {
          error: Error('Password confirmation does not match'),
        }
      }

      try {
        const result = schema.validateSync(data)
        return { value: result }
      }
      catch (e) {
        return { error: e }
      }
    },
  }, (req, res) => {
    const {
      name,
      email,
      password,
      passwordConfirmation,
    } = req.body

    if (req.validationError) {
      res.view('src/views/users/new', {
        name,
        email,
        password,
        passwordConfirmation,
        error: req.validationError,
      })
      return
    }

    const user = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
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
