import { state } from '../index.js'

export const index = (req, res) => {
  const messages = res.flash()
  res.view('users/index', {
    users: state.users,
    flash: messages,
  })
}

export const newUser = (req, res) => {
  res.view('users/new')
}

export const show = (req, res) => {
  const id = Number(req.params.id)
  const user = state.users.find((u) => u.id === id)

  if (!user) {
    res.code(404).send({ message: 'User not found' })
    return
  }

  res.view('users/show', { user })
}

export const edit = (req, res) => {
  const id = Number(req.params.id)
  const user = state.users.find((u) => u.id === id)

  if (!user) {
    res.code(404).send({ message: 'User not found' })
    return
  }

  res.view('users/edit', { user })
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

  const user = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  }

  state.users.push(user)

  req.flash('success', 'User has been created')
  res.redirect('/users')
}

export const update = (req, res) => {
  const id = Number(req.params.id)

  const index = state.users.findIndex((u) => u.id === id)

  if (index === -1) {
    res.code(404).send({ message: 'User not found' })
    return
  }

  if (req.validationError) {
    const user = { ...state.users[index], ...req.body }
    res.view('users/edit', {
      user,
      error: req.validationError,
    })
    return
  }

  state.users[index] = {
    ...state.users[index],
    name: req.body.name,
    email: req.body.email,
  }

  res.redirect('/users')
}

export const destroy = (req, res) => {
  const id = Number(req.params.id)

  const index = state.users.findIndex((u) => u.id === id)

  if (index === -1) {
    res.code(404).send({ message: 'User not found' })
    return
  }

  state.users.splice(index, 1)

  res.redirect('/users')
}