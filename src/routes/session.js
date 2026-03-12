import * as yup from 'yup'
import bcrypt from 'bcrypt'
import { db } from '../index.js'
import { validatorCompiler } from '../lib/validatorCompiler.js'

const sessionSchema = yup.object({
  email: yup.string().email('Некорректный email').required('Email обязателен'),
  password: yup.string().min(1, 'Пароль обязателен').required('Пароль обязателен'),
})

export default async (app) => {
  app.get('/session/new', { name: 'newSession', config: { isPublic: true } }, (req, res) => {
    res.view('session/new')
  })

  app.post('/session', {
    name: 'session',
    config: { isPublic: true },
    attachValidation: true,
    schema: { body: sessionSchema },
    validatorCompiler,
  }, async (req, res) => {
    if (req.validationError) {
      req.flash('error', 'Неверный email или пароль')
      return res.redirect(app.reverse('newSession'))
    }

    const { email, password } = req.body

    const user = await new Promise((resolve, reject) => {
      db.get('SELECT id, password FROM users WHERE email = ?', [email], (error, row) => {
        if (error) return reject(error)
        resolve(row)
      })
    }).catch((err) => {
      req.log.error(err, 'DB error during login')
      return null
    })

    if (user && await bcrypt.compare(password, user.password)) {
      await req.session.regenerate()
      req.session.userId = user.id
      return res.redirect('/')
    }

    req.flash('error', 'Неверный email или пароль')
    return res.redirect(app.reverse('newSession'))
  })

  app.post('/session/delete', { name: 'deleteSession', config: { isPublic: true } }, (req, res) => {
    req.session.destroy()
    res.redirect('/')
  })
}
