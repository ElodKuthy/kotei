const model = require('./model/model')()

model.database.sync({ force: true }).then(() => console.log('Done'))