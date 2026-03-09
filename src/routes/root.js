export default async (app) => {
  app.get('/', (req, res) => {
    res.view('index')
  })
}