import { db } from '../index.js'

export const index = (req, res) => {
  db.all('SELECT * FROM users', (error, users) => {
    if (error) {
      res.code(500).send({ message: 'Database error' })
      return
    }

    const messages = res.flash()
    res.view('users/index', {
      users,
      flash: messages,
    })
  })
}

export const newUser = (req, res) => {
  res.view('users/new')
}

export const show = (req, res) => {
  const id = Number(req.params.id)

  db.get('SELECT * FROM users WHERE id = ?', [id], (error, user) => {
    if (error) {
      res.code(500).send({ message: 'Database error' })
      return
    }

    if (!user) {
      res.code(404).send({ message: 'User not found' })
      return
    }

    res.view('users/show', { user })
  })
}

export const edit = (req, res) => {
  const id = Number(req.params.id)

  db.get('SELECT * FROM users WHERE id = ?', [id], (error, user) => {
    if (error) {
      res.code(500).send({ message: 'Database error' })
      return
    }

    if (!user) {
      res.code(404).send({ message: 'User not found' })
      return
    }

    res.view('users/edit', { user })
  })
}

export const create = (req, res) => {
  const {
    name,
    email,
    password,
    passwordConfirmation,
  } = req.body

  if (req.validationError) {
    res.view('users/new', {
      name,
      email,
      password,
      passwordConfirmation,
      error: req.validationError,
    })
    return
  }

  const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
  stmt.run([name.trim(), email.trim().toLowerCase(), password], function (error) {
    if (error) {
      res.view('users/new', {
        name,
        email,
        password,
        passwordConfirmation,
        error,
      })
      return
    }

    req.flash('success', 'User has been created')
    res.redirect(`/users/${this.lastID}`)
  })
}

export const update = (req, res) => {
  const id = Number(req.params.id)

  db.get('SELECT * FROM users WHERE id = ?', [id], (error, user) => {
    if (error) {
      res.code(500).send({ message: 'Database error' })
      return
    }

    if (!user) {
      res.code(404).send({ message: 'User not found' })
      return
    }

    if (req.validationError) {
      res.view('users/edit', {
        user: { ...user, ...req.body },
        error: req.validationError,
      })
      return
    }

    const stmt = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?')
    stmt.run([req.body.name, req.body.email, id], (err) => {
      if (err) {
        res.code(500).send({ message: 'Database error' })
        return
      }
      req.flash('success', 'User has been updated')
      res.redirect('/users')
    })
  })
}

export const destroy = (req, res) => {
  const id = Number(req.params.id)

  const stmt = db.prepare('DELETE FROM users WHERE id = ?')
  stmt.run(id, (err) => {
    if (err) {
      res.send(err)
      return
    }
    res.redirect('/users')
  })
}
