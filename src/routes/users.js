import * as yup from 'yup'
import * as usersController from '../controllers/users.js'
import { validatorCompiler } from '../lib/validatorCompiler.js'

const userSchema = yup.object({
  name: yup.string().min(2, 'Имя должно содержать минимум 2 символа').required('Имя обязательно'),
  email: yup.string().email('Некорректный email').required('Email обязателен'),
  password: yup.string().min(5, 'Пароль должен содержать минимум 5 символов').required('Пароль обязателен'),
  passwordConfirmation: yup.string()
    .oneOf([yup.ref('password')], 'Пароли должны совпадать')
    .required('Подтверждение пароля обязательно'),
})

const userEditSchema = yup.object({
  name: yup.string().min(2, 'Имя должно содержать минимум 2 символа').required('Имя обязательно'),
  email: yup.string().email('Некорректный email').required('Email обязателен'),
})

export default async (app) => {
  app.get('/users', { name: 'users' }, usersController.index)

  app.get('/users/new', { name: 'newUser', config: { isPublic: true } }, usersController.newUser)

  app.get('/users/:id', { name: 'user' }, usersController.show)

  app.get('/users/:id/edit', { name: 'editUser' }, usersController.edit)

  app.post('/users', {
    name: 'createUser',
    config: { isPublic: true },
    attachValidation: true,
    schema: {
      body: userSchema,
    },
    validatorCompiler,
  }, usersController.create)

  app.post('/users/:id', {
    name: 'updateUser',
    attachValidation: true,
    schema: {
      body: userEditSchema,
    },
    validatorCompiler,
  }, usersController.update)

  app.delete('/users/:id', { name: 'deleteUser' }, usersController.destroy)
}
