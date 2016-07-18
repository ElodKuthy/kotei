const Sequelize = require('sequelize')

module.exports = database =>
database.define('CreditTemplate', {
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1
        }
    }
})
