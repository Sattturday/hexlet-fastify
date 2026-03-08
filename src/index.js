import fastify from 'fastify'
import view from '@fastify/view'
import pug from 'pug'

const app = fastify()
const port = 5000

// Подключаем pug через плагин
await app.register(view, { engine: { pug } })

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

// Маршрут для главной страницы
app.get('/', (req, res) => {
  res.view('src/views/index')
})

// Маршрут для списка курсов (уже есть в вашем коде)
app.get('/courses', (req, res) => {
  const data = {
    courses: state.courses,
  }
  res.view('src/views/courses/index', data)
})

// Маршрут для отдельного курса (уже есть в вашем коде)
app.get('/courses/:id', (req, res) => {
  const { id } = req.params
  const course = state.courses.find(({ id: courseId }) => courseId === parseInt(id))
  if (!course) {
    res.code(404).send({ message: 'Course not found' })
    return
  }
  const data = {
    course,
  }
  res.view('src/views/courses/show', data)
})

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`)
})