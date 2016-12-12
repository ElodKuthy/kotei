const Sequelize = require('sequelize')

module.exports = database =>
database.define('SubscriptionTemplate', {
    allowFreeCredits: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null
    }
})
