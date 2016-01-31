const Sequelize = require('sequelize')
const database = require('./database')

const SubscriptionVariant = database.define('SubscriptionVariant', {
    valid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1
        }
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 0
        }
    }
})

module.exports = SubscriptionVariant