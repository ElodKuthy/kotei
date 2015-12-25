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
    through: Attendee,
    as: 'Subscriptions'
})
Subscription.belongsToMany(Training, {
    through: Attendee,
    as: 'Trainings'
})

module.exports = Attendee
