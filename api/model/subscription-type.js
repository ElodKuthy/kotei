const Sequelize = require('sequelize')
const database = require('./database')
const Subscription = require('./subscription')
const Training = require('./training')

const SubscriptionType = database.define('SubscriptionType', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        },
    }
})

SubscriptionType.hasMany(Subscription, {
    foreignKey: {
        allowNull: false
    }
})

Training.belongsToMany(SubscriptionType, {
    through: 'AllowedSubscriptions'
})

SubscriptionType.belongsToMany(Training, {
    through: 'AllowedSubscriptions'
})

module.exports = SubscriptionType