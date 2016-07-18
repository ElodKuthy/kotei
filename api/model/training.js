const moment = require('moment')
const Sequelize = require('sequelize')

module.exports = database =>
database.define('Training', {
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
    max: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1
        }
    }
})
