const express = require('express')
const index = require('./views/index')

const app = express()

app.set('port', process.env.port || 3000)

app.use('/assets', express.static('build/assets'))

app.get('/', (req, res) => {
  res.type('.html')
  res.end(index())
})

app.listen(app.get('port'), () => {
  console.log(`Application listening on localhost:${app.get('port')}`)
})
