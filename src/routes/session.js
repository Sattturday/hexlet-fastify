import { state } from '../index.js'

export default async (app) => {
  app.get('/session/new', { name: 'newSession' }, (req, res) => {
    res.view('session/new')
  })

  app.post('/session', { name: 'session' }, (req, res) => {
    const { email } = req.body

    const user = state.users.find((u) => u.email === email)

    if (user) {
      req.session.userId = user.id
    }

    res.redirect('/')
  })
}