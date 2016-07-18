const Sequelize = require('sequelize')

module.exports = database =>
database.define('Subscription', {
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
    price: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 0
        }
    }
})
