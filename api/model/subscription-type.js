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
    }
})
Subscription.belongsTo(SubscriptionType, {
    foreignKey: {
        allowNull: false
    }
})

Training.belongsToMany(SubscriptionType, {through: 'allowed_subscriptions'})
SubscriptionType.belongsToMany(Training, {through: 'allowed_subscriptions'})

module.exports = SubscriptionType