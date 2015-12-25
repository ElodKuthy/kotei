const Sequelize = require('sequelize')
const database = require('./database')
const Subscription = require('./subscription')
const Training = require('./training')

const SubscriptionType = database.define('subscription_type', {
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
    },
    as: 'Subscriptions'
})
Subscription.belongsTo(SubscriptionType, {
    foreignKey: {
        allowNull: false
    },
    as: 'Type'
})

Training.belongsToMany(SubscriptionType, {
    through: 'allowed_subscriptions',
    as: 'SubscriptionTypes'
})
SubscriptionType.belongsToMany(Training, {
    through: 'allowed_subscriptions',
    as: 'Trainings'
})

module.exports = SubscriptionType