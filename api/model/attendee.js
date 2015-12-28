const Sequelize = require('sequelize')
const database = require('./database')
const Training = require('./training')
const Subscription = require('./subscription')

const Attendee = database.define('attendee', {
    checkIn: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
})

Training.belongsToMany(Subscription, {
    through: Attendee
})
Subscription.belongsToMany(Training, {
    through: Attendee
})

module.exports = Attendee
