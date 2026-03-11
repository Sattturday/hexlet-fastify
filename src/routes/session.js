import { db } from '../index.js'

export default async (app) => {
  app.get('/session/new', { name: 'newSession' }, (req, res) => {
    res.view('session/new')
  })

  app.post('/session', { name: 'session' }, (req, res) => {
    const { email } = req.body

    db.get('SELECT * FROM users WHERE email = ?', [email], (error, user) => {
      if (user) {
        req.session.userId = user.id
      }

      res.redirect('/')
    })
  })
}
