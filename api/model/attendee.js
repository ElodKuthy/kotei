const Sequelize = require('sequelize')

module.exports = database =>
database.define('Attendee', {
    checkIn: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
})
