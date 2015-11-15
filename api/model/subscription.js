const Sequelize = require('sequelize')
const database = require('./database')
const Training = require('./training')

const Subscription = database.define('subscription', {
    from: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
            isDate: true
        }
    },
    to: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
            isDate: true
        }
    },
    amount: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
            isInt: true,
            min: 1
        }
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
            isInt: true,
            min: 0
        }
    }
})

module.exports = Subscription