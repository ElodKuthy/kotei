const Sequelize = require('sequelize')

module.exports = database =>
database.define('SubscriptionVariant', {
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
    },
    allowFreeCredits: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null
    }
})
