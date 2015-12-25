const moment = require('moment')
const Sequelize = require('sequelize')
const database = require('./database')

const Training = database.define('training', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
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

module.exports = Training