import * as yup from 'yup'
import * as coursesController from '../controllers/courses.js'

const courseSchema = yup.object({
  title: yup.string().min(2, 'Title must contain at least 2 characters'),
  description: yup.string().min(10, 'Description must contain at least 10 characters'),
})

const validatorCompiler = ({ schema }) => (data) => {
  try {
    const value = schema.validateSync(data)
    return { value }
  } catch (e) {
    return { error: e }
  }
}

export default async (app) => {
  app.get('/courses', { name: 'courses' }, coursesController.index)

  app.get('/courses/new', { name: 'newCourse' }, coursesController.newCourse)

  app.get('/courses/:id', { name: 'course' }, coursesController.show)

  app.get('/courses/:id/edit', { name: 'editCourse' }, coursesController.edit)

  app.post('/courses', {
    name: 'createCourse',
    attachValidation: true,
    schema: {
      body: courseSchema,
    },
    validatorCompiler,
  }, coursesController.create)

  app.post('/courses/:id', {
    name: 'updateCourse',
    attachValidation: true,
    schema: {
      body: courseSchema,
    },
    validatorCompiler,
  }, coursesController.update)

  app.delete('/courses/:id', { name: 'deleteCourse' }, coursesController.destroy)
}