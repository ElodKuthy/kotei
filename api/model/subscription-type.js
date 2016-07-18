const Sequelize = require('sequelize')

module.exports = database =>
database.define('SubscriptionType', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        },
    }
})
