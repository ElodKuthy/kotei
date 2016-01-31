const Sequelize = require('sequelize')
const database = require('./database')

const Credit = database.define('Credit', {
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1
        }
    }
})

module.exports = Credit
