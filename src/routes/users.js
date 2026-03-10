import * as yup from 'yup'
import * as usersController from '../controllers/users.js'

const userSchema = yup.object({
  name: yup.string().min(2, 'Name must contain at least 2 characters'),
  email: yup.string().email('Invalid email'),
  password: yup.string().min(5, 'Password must contain at least 5 characters'),
  passwordConfirmation: yup.string().min(5),
})

const userEditSchema = yup.object({
  name: yup.string().min(2, 'Name must contain at least 2 characters'),
  email: yup.string().email('Invalid email'),
})

const validatorCompiler = ({ schema }) => (data) => {
  if (data.password !== data.passwordConfirmation) {
    return {
      error: new Error('Password confirmation does not match'),
    }
  }

  try {
    const result = schema.validateSync(data)
    return { value: result }
  }
  catch (e) {
    return { error: e }
  }
}

export default async (app) => {
  app.get('/users', { name: 'users' }, usersController.index)

  app.get('/users/new', { name: 'newUser' }, usersController.newUser)

  app.get('/users/:id', { name: 'user' }, usersController.show)

  app.get('/users/:id/edit', { name: 'editUser' }, usersController.edit)

  app.post('/users', {
    name: 'createUser',
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