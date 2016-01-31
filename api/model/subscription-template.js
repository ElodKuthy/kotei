const Sequelize = require('sequelize')
const database = require('./database')

const SubscriptionTemplate = database.define('SubscriptionTemplate', {
    max: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
            isInt: true,
            min: 1
        }
    }
})

module.exports = SubscriptionTemplate