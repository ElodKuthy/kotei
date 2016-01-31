const Sequelize = require('sequelize')
const database = require('./database')

const CreditTemplate = database.define('CreditTemplate', {
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1
        }
    }
})

module.exports = CreditTemplate
