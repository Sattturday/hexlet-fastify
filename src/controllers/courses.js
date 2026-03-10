import { state } from '../index.js'

const parseCourseId = (rawId) => {
  if (!/^\d+$/.test(rawId)) {
    return null
  }

  const id = Number(rawId)

  return Number.isSafeInteger(id) ? id : null
}

export const index = (req, res) => {
  const term = req.query.term || ''
  const normalizedTerm = term.toLowerCase()

  const courses = state.courses.filter((course) => {
    const titleMatch = course.title.toLowerCase().includes(normalizedTerm)
    const descriptionMatch = course.description.toLowerCase().includes(normalizedTerm)

    return titleMatch || descriptionMatch
  })

  const messages = res.flash()
  res.view('courses/index', {
    courses,
    term,
    flash: messages,
  })
}

export const show = (req, res) => {
  const id = parseCourseId(req.params.id)

  if (id === null) {
    res.code(400).send({ message: 'Course id must be a positive integer' })
    return
  }

  const course = state.courses.find((c) => c.id === id)

  if (!course) {
    res.code(404).send({ message: 'Course not found' })
    return
  }

  res.view('courses/show', { course })
}

export const newCourse = (req, res) => {
  res.view('courses/new')
}

export const edit = (req, res) => {
  const id = parseCourseId(req.params.id)

  if (id === null) {
    res.code(400).send({ message: 'Course id must be a positive integer' })
    return
  }

  const course = state.courses.find((c) => c.id === id)

  if (!course) {
    res.code(404).send({ message: 'Course not found' })
    return
  }

  res.view('courses/edit', { course })
}

export const create = (req, res) => {
  if (req.validationError) {
    req.flash('error', req.validationError.message)
    res.view('courses/new', {
      ...req.body,
      error: req.validationError,
      flash: res.flash(),
    })
    return
  }

  const { title, description } = req.body

  const course = {
    id: state.courses.length + 1,
    title: title.trim(),
    description: description.trim(),
  }

  state.courses.push(course)

  req.flash('success', 'Course has been created')
  res.redirect('/courses')
}

export const update = (req, res) => {
  const id = parseCourseId(req.params.id)

  if (id === null) {
    res.code(400).send({ message: 'Course id must be a positive integer' })
    return
  }

  const index = state.courses.findIndex((c) => c.id === id)

  if (index === -1) {
    res.code(404).send({ message: 'Course not found' })
    return
  }

  const { title, description } = req.body

  state.courses[index] = {
    ...state.courses[index],
    title: title.trim(),
    description: description.trim(),
  }

  res.redirect('/courses')
}

export const destroy = (req, res) => {
  const id = parseCourseId(req.params.id)

  if (id === null) {
    res.code(400).send({ message: 'Course id must be a positive integer' })
    return
  }

  const index = state.courses.findIndex((c) => c.id === id)

  if (index === -1) {
    res.code(404).send({ message: 'Course not found' })
    return
  }

  state.courses.splice(index, 1)

  res.redirect('/courses')
}