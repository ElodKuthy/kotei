const Sequelize = require('sequelize')

module.exports = database =>
database.define('SubscriptionTemplate', {
    max: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
            isInt: true,
            min: 1
        }
    }
})
