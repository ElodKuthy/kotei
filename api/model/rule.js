const Sequelize = require('sequelize')
const database = require('./database')

const Rule = database.define('Rule', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    value: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
})

module.exports = Rule