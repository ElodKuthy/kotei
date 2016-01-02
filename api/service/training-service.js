const moment = require('moment')
const R = require('ramda')

const errors = require('../common/errors')
const texts = require('../localization/texts')
const parser = require('../common/parser')

const roles = require('../common/roles')
const SubscriptionType = require('../model/subscription-type')
const Training = require('../model/training')
const User = require('../model/user')
const Location = require('../model/location')
const Subscription = require('../model/subscription')

const Promise = require('bluebird')

const checkAdmin = (training, auth) => {
    if (!auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    return Promise.resolve(training)
}

const checkCoach = (training) => {
    return User.findAll({
        where: {
            $and: [{
                id: training.coach_id
            }, {
                role: roles.coach
            }]
        }
    }).then((coach) => {

        if (coach.length !== 1) {
            return Promise.reject(errors.invalidCoach)
        }

        return Promise.resolve(training)
    })
}

const calculateDates = (training) => {

    if (moment(training.from).add({ minutes: 5 }).isAfter(training.to)) {
        return Promise.reject(errors.trainingTooShort)
    }

    if (!moment(training.from).isSame(training.to, 'day')) {
        return Promise.reject(errors.trainingTooLong)
    }

    var dates = []
    var currentFrom = moment(training.from)
    var currentTo = moment(training.to)
    var interval = training.interval ? moment(training.interval) : moment(currentTo)

    while (currentTo.isBefore(interval) || currentTo.isSame(interval, 'minute')) {
        dates.push({from: currentFrom.format(), to: currentTo.format()})
        currentFrom.add({ days: 7 })
        currentTo.add({ days: 7 })
    }

    return Promise.resolve(dates)
}

const addTraining = (training) => {

    const collidingTrainings = Training.findAll({
        where: {
            $and: [{
                location_id: training.location_id
            }, {
                $or: [
                    { from: { $and: [ { $gt: training.from }, { $lt: training.to } ] } },
                    { to: { $and: [ { $gt: training.from }, { $lt: training.to } ] } },
                    {
                        $and: [
                            { from: { $eq: training.from} },
                            { to: { $eq: training.to } }
                        ]
                    }
                ]
            }]
        }
    })

    return collidingTrainings.then((collidingTrainings) => {

        if (collidingTrainings.length) {
            return Promise.reject(errors.trainingTimeCollide)
        }

        return Training.create(training)
            .then((createdTraining) => {
                return createdTraining.addSubscriptionTypes(training.subscription_type_ids)
            })
            .catch((error) => {
                return Promise.reject(errors.missingOrInvalidParameters)
            })
    })

}

const addTrainings = (training, dates) => {
    const trainings = R.map((date) => addTraining(R.merge(training, date)), dates)

    return Promise.all(trainings)
}

const add = (training, auth) => {

    return checkAdmin(training, auth)
        .then(checkCoach)
        .then(calculateDates)
        .then((dates) => addTrainings(training, dates))
        .then(() => Promise.resolve(texts.successfulTrainingCreation))
}

const find = (query, auth) => {
    if (!auth.isAuth) {
        return Promise.reject(errors.unauthorized)
    }

    if (query.subscription_type_id) {
        return SubscriptionType.findOne({
             where: {
                 id: query.subscription_type_id
             }
        }).then((subscriptionType) => {
             return subscriptionType.getTrainings(parser.parseQuery({
                attributes: ['id', 'name', 'from', 'to', 'max', 'coach_id', 'location_id']
             }, query))
        }).catch((error) => Promise.reject(errors.missingOrInvalidParameters))
    }

    return Training.findAll(parser.parseQuery({
        attributes: ['id', 'name', 'from', 'to', 'max'],
        include: [{
            attributes: ['id', 'familyName', 'givenName', 'nickname'],
            model: User,
            as: 'Coach'
        }, {
            attributes: ['id', 'name'],
            model: Location,
            as: 'Location'
        }, {
            attributes: ['id'],
            model: Subscription,
            as: 'Subscriptions',
            include: [{
                attributes: ['id', 'familyName', 'givenName', 'nickname'],
                model: User,
                as: 'Client'
            }]
        }]
    }, query)).catch((error) => Promise.reject(errors.missingOrInvalidParameters))
}

module.exports = {
    add: add,
    find: find
}