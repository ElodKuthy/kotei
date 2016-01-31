const Sequelize = require('sequelize')
const database = require('./database')

const TrainingType = database.define('TrainingType', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
})

module.exports = TrainingType