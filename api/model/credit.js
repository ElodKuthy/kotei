const Sequelize = require('sequelize')

module.exports = database =>
database.define('Credit', {
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1
        }
    }
})
