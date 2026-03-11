import { db } from '../index.js'

const parseCourseId = (rawId) => {
  if (!/^\d+$/.test(rawId)) {
    return null
  }

  const id = Number(rawId)

  return Number.isSafeInteger(id) ? id : null
}

export const index = (req, res) => {
  const term = req.query.term || ''
  const normalizedTerm = `%${term.toLowerCase()}%`

  const sql = 'SELECT * FROM courses WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ?'

  db.all(sql, [normalizedTerm, normalizedTerm], (error, courses) => {
    if (error) {
      res.code(500).send({ message: 'Database error' })
      return
    }

    res.view('courses/index', {
      courses,
      term,
    })
  })
}

export const show = (req, res) => {
  const id = parseCourseId(req.params.id)

  if (id === null) {
    res.code(400).send({ message: 'Course id must be a positive integer' })
    return
  }

  db.get('SELECT * FROM courses WHERE id = ?', [id], (error, course) => {
    if (error) {
      res.code(500).send({ message: 'Database error' })
      return
    }

    if (!course) {
      res.code(404).send({ message: 'Course not found' })
      return
    }

    res.view('courses/show', { course })
  })
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

  db.get('SELECT * FROM courses WHERE id = ?', [id], (error, course) => {
    if (error) {
      res.code(500).send({ message: 'Database error' })
      return
    }

    if (!course) {
      res.code(404).send({ message: 'Course not found' })
      return
    }

    res.view('courses/edit', { course })
  })
}

export const create = (req, res) => {
  if (req.validationError) {
    res.view('courses/new', {
      ...req.body,
      error: req.validationError,
    })
    return
  }

  const { title, description } = req.body

  const stmt = db.prepare('INSERT INTO courses (title, description) VALUES (?, ?)')
  stmt.run([title.trim(), description.trim()], function (error) {
    if (error) {
      res.view('courses/new', {
        ...req.body,
        error,
      })
      return
    }

    req.flash('success', 'Course has been created')
    res.redirect(`/courses`)
  })
}

export const update = (req, res) => {
  const id = parseCourseId(req.params.id)

  if (id === null) {
    res.code(400).send({ message: 'Course id must be a positive integer' })
    return
  }

  db.get('SELECT * FROM courses WHERE id = ?', [id], (error, course) => {
    if (error) {
      res.code(500).send({ message: 'Database error' })
      return
    }

    if (!course) {
      res.code(404).send({ message: 'Course not found' })
      return
    }

    if (req.validationError) {
      res.view('courses/edit', {
        course: { ...course, ...req.body },
        error: req.validationError,
      })
      return
    }

    const { title, description } = req.body

    const stmt = db.prepare('UPDATE courses SET title = ?, description = ? WHERE id = ?')
    stmt.run([title.trim(), description.trim(), id], (err) => {
      if (err) {
        res.code(500).send({ message: 'Database error' })
        return
      }
      req.flash('success', 'Course has been updated')
      res.redirect('/courses')
    })
  })
}

export const destroy = (req, res) => {
  const id = parseCourseId(req.params.id)

  if (id === null) {
    res.code(400).send({ message: 'Course id must be a positive integer' })
    return
  }

  const stmt = db.prepare('DELETE FROM courses WHERE id = ?')
  stmt.run(id, (err) => {
    if (err) {
      res.send(err)
      return
    }
    res.redirect('/courses')
  })
}
