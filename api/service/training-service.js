const moment = require('moment')
const R = require('ramda')

const errors = require('../common/errors')
const texts = require('../localization/texts')
const parser = require('../common/parser')

const roles = require('../common/roles')
const model = require('../model/model')
const Training = model.Training
const User = model.User
const Location = model.Location
const Subscription = model.Subscription
const TrainingType = model.TrainingType

const Promise = require('bluebird')

const checkAdmin = (training, auth) => {
    if (!auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    return Promise.resolve(training)
}

const checkCoach = (training) => {
    return User.findById(training.coach_id, {
        where: {
            role: roles.coach
        }
    }).then((coach) => {

        if (!coach) {
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

    Training.findOne({
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
    }).then((collidingTraining) => {

        if (collidingTraining) {
            return Promise.reject(errors.trainingTimeCollide)
        }

        return Training.create(training)
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

    return Training.findAll(parser.parseQuery({
        attributes: ['id', 'from', 'to', 'max'],
        include: [{
             attributes: ['id', 'name'],
             model: TrainingType
        }, {
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

const findTrainingType = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    return TrainingType.findAll(parser.parseQuery({
        attributes: ['id', 'name']
    }, query)).catch((error) => Promise.reject(errors.missingOrInvalidParameters))
}

module.exports = {
    add: add,
    find: find,
    findTrainingType: findTrainingType
}