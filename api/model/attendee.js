const Sequelize = require('sequelize')
const database = require('./database')

const Attendee = database.define('Attendee', {
    checkIn: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
})

module.exports = Attendee