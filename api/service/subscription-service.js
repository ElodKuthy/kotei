const moment = require('moment')
const R = require('ramda')

const errors = require('../common/errors')
const parser = require('../common/parser')
const roles = require('../common/roles')

const model = require('../model/model')
const User = model.User
const Subscription = model.Subscription
const SubscriptionType = model.SubscriptionType
const SubscriptionTemplate = model.SubscriptionTemplate
const SubscriptionVariant = model.SubscriptionVariant
const Training = model.Training
const CreditTemplate = model.CreditTemplate
const TrainingType = model.TrainingType
const Credit = model.Credit

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

const findSubscriptionTemplate = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    return SubscriptionTemplate.findAll(parser.parseQuery({
        attributes: ['id', 'subscription_type_id'],
        include: [{
            attributes: ['valid', 'price'],
            model: SubscriptionVariant
        }, {
            attributes: ['id', 'amount'],
            model: CreditTemplate,
            include: [{
                attributes: ['id', 'name'],
                model: TrainingType
            }]
        }]
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
    return (User.findById(subscription.client_id, {
        where: {
            role: roles.client
        }
    })).then((result) => {
        return result
            ? Promise.resolve(subscription)
            : Promise.reject(errors.missingOrInvalidParameters)
    })
}

const checkIssuerIsCoach = (subscription) => {
    return (User.findById(subscription.coach_id, {
        where: {
            role: roles.coach
        }
    })).then((result) => {
        return result
            ? Promise.resolve(subscription)
            : Promise.reject(errors.missingOrInvalidParameters)
    })
}

const decorateNewSubcriptionData = (subscription) => {
    subscription.Credits = R.map((credit) => {
        delete credit.id
        if (credit.TrainingType) {
            credit.training_type_id = credit.TrainingType.id
        }
        if (credit.Coach) {
            credit.coach_id = credit.Coach.id
        }

        return credit
    }, subscription.Credits)

    return subscription
}

const addSubscription = (subscription) => {
    return Subscription.create(subscription, { include: [ Credit ] }).then(() => subscription)
}

const orDates = R.map((date) => { return { from: date } })

const addOneWeek = R.map((date) => moment(date).add({ week: 1 }).format())

const concat = (a, b) => b ? R.concat(a, b) : a

const addToDefaultTrainings = (subscription, auth, currentDates) => {

    if (!currentDates || !currentDates.length || moment(currentDates[0]).isAfter(subscription.to)) {
        return currentDates
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
        .then(decorateNewSubcriptionData)
        .then(addSubscription)
        .then((newSubscription) => addToDefaultTrainings(newSubscription, auth, newSubscription.defaultTrainingDates))
}

module.exports = {
    findSubscriptionType: findSubscriptionType,
    findSubscriptionTemplate: findSubscriptionTemplate,
    add: add
}