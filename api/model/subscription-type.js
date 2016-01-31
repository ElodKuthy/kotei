const Sequelize = require('sequelize')
const database = require('./database')

const SubscriptionType = database.define('SubscriptionType', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        },
    }
})

module.exports = SubscriptionType