const Sequelize = require('sequelize')
const config = require('../common/config')
const logger = require('../common/logger')

const database = new Sequelize(config.database.name, config.database.user, config.database.password, {
    define: {
        paranoid: true,
        underscored: true
    },
    host: config.database.host,
    timezone: 'Europe/Budapest',
    logging: logger.verbose
})

module.exports = database