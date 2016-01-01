const Sequelize = require('sequelize')
const database = require('./database')
const SubscriptionType = require('./subscription-type')

const SubscriptionVariant = database.define('SubscriptionVariant', {
    valid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1
        }
    },
    amount: {
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

SubscriptionType.hasMany(SubscriptionVariant, {
    foreignKey: {
        allowNull: false
    }
})

module.exports = SubscriptionVariant