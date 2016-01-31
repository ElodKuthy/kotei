const Sequelize = require('sequelize')
const database = require('./database')

const Location = database.define('Location', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
})

module.exports = Location