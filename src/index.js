import fastify from 'fastify'

const app = fastify()
const port = 5000

app.get('/users', (req, res) => {
  res.send('GET /users')
})

app.post('/users', (req, res) => {
  res.send('POST /users')
})

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`)
})