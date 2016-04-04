const Sequelize = require('sequelize')
const config = require('../common/config')

const database = new Sequelize(config.database.name, config.database.user, config.database.password, {
    define: {
        paranoid: true,
        underscored: true
    },
    timezone: 'Europe/Budapest'
})

module.exports = database