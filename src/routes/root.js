export default async (app) => {
  app.get('/', { name: 'root', config: { isPublic: true } }, (req, res) => {
    const visited = req.cookies.visited

    res.cookie('visited', true)

    res.view('index', { visited })
  })
}
