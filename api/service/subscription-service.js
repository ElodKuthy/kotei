const moment = require('moment')
const R = require('ramda')

const errors = require('../common/errors')
const parser = require('../common/parser')
const roles = require('../common/roles')

const User = require('../model/user')
const Subscription = require('../model/subscription')
const SubscriptionType = require('../model/subscription-type')
const SubscriptionVariant = require('../model/subscription-variant')
const Training = require('../model/training')

const attendeeService = require('./attendee-service')

const Promise = require('bluebird')

const findSubscriptionType = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    return SubscriptionType.findAll(parser.parseQuery({
        attributes: ['id', 'name']
    }, query)).catch((error) => Promise.reject(errors.missingOrInvalidParameters))
}

const findSubscriptionVariant = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    return SubscriptionVariant.findAll(parser.parseQuery({
        attributes: ['id', 'valid', 'amount', 'price', 'subscription_type_id']
    }, query)).catch((error) => Promise.reject(errors.missingOrInvalidParameters))
}

const checkAuth = (subscription, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    if (auth.isCoach) {
        if (subscription.coach_id != auth.id) {
            return Promise.reject(errors.unauthorized)
        }

        if (!moment().isSame(subscription.from, 'day')) {
            return Promise.reject(errors.unauthorized)
        }
    }

    return Promise.resolve(subscription)
}

const checkDates = (subscription) => {
    if (moment(subscription.from).isAfter(subscription.to)) {
        Promise.reject(errors.missingOrInvalidParameters)
    }

    return Promise.resolve(subscription)
}

const checkSubscriberIsClient = (subscription) => {
    return (User.findAll({
        where: {
            $and: [
                {
                    role: roles.client
                },
                {
                    id: subscription.client_id
                }
            ]
        }
    })).then((result) => {
        return result.length === 1
            ? Promise.resolve(subscription)
            : Promise.reject(errors.missingOrInvalidParameters)
    })
}

const checkIssuerIsCoach = (subscription) => {
    return (User.findAll({
        where: {
            $and: [
                {
                    role: roles.coach
                },
                {
                    id: subscription.coach_id
                }
            ]
        }
    })).then((result) => {
        return result.length === 1
            ? Promise.resolve(subscription)
            : Promise.reject(errors.missingOrInvalidParameters)
    })
}

const orDates = R.map((date) => { return { from: date } })

const addOneWeek = R.map((date) => moment(date).add({ week: 1 }).format())

const concat = (a, b) => b ? R.concat(a, b) : a

const addToDefaultTrainings = (subscription, auth, currentDates) => {

    if (!currentDates || !currentDates.length || moment(currentDates[0]).isAfter(subscription.to)) {
        return
    }

    const trainings = Training.findAll({
        where: {
            $or: orDates(currentDates)
        }
    })

    return trainings
        .then((trainings) => {
            return Promise.all(R.map((training) => attendeeService.add(training.id, subscription.client_id, auth), trainings))
        })
        .catch(() => Promise.resolve())
        .then(() => {
            return addToDefaultTrainings(subscription, auth, addOneWeek(currentDates))
        }).then((additionalTrainings) => {
           return Promise.resolve(concat(trainings.value(), additionalTrainings))
        })
}

const add = (subscription, auth) => {

    return checkAuth(subscription, auth)
        .then(checkDates)
        .then(checkSubscriberIsClient)
        .then(checkIssuerIsCoach)
        .then((subscription) => Subscription.create(subscription))
        .then((createdSubscription) => addToDefaultTrainings(subscription, auth, subscription.defaultTrainingDates))
}

module.exports = {
    findSubscriptionType: findSubscriptionType,
    findSubscriptionVariant: findSubscriptionVariant,
    add: add
}