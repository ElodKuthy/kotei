const moment = require('moment')
const R = require('ramda')
const sequelize = require('sequelize')

const errors = require('../common/errors')
const texts = require('../localization/texts')
const parser = require('../common/parser')
const rules = require('../common/rules')

const roles = require('../common/roles')
const model = require('../model/model')()
const Training = model.Training
const User = model.User
const Location = model.Location
const Subscription = model.Subscription
const TrainingType = model.TrainingType
const Attendee = model.Attendee
const Credit = model.Credit

const mailerService = require('./mailer-service')

const Promise = require('bluebird')

const checkAdmin = (training, auth) => {
    if (!auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
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
            return Promise.reject(errors.invalidCoach())
        }

        return Promise.resolve(training)
    })
}

const calculateDates = (training) => {

    if (moment(training.from).add({ minutes: 5 }).isAfter(training.to)) {
        return Promise.reject(errors.trainingTooShort())
    }

    if (!moment(training.from).isSame(training.to, 'day')) {
        return Promise.reject(errors.trainingTooLong())
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

const checkCollidingTraining = training => {
    return Training.findOne({
        where: {
            $and: [{
                id: {
                    $not: training.id
                }
            }, {
                location_id: training.location_id
            }, {
                $or: [
                    { from: { $and: [ { $gt: training.from }, { $lt: training.to } ] } },
                    { to: { $and: [ { $gt: training.from }, { $lt: training.to } ] } },
                    {
                        $and: [
                            { from: { $eq: training.from } },
                            { to: { $eq: training.to } }
                        ]
                    }
                ]
            }]
        }
    }).then((collidingTraining) => {
        if (collidingTraining) {
            return Promise.reject(errors.trainingTimeCollide())
        }

        return Promise.resolve(training)
    })
}

const addTraining = (training) => {
    return checkCollidingTraining(training).then(training => {
        return Training.create(training)
            .catch((error) => {
                return Promise.reject(errors.missingOrInvalidParameters())
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
        return Promise.reject(errors.unauthorized())
    }

    return Promise.all([
        Training.findAll(parser.parseQuery({
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
                }, {
                    attributes: ['id'],
                    model: Training
                }, {
                    attributes: ['id'],
                    model: Credit
                }]
            }]
        }, query)), 
        Subscription.findAll({
            where: {
                client_id: auth.id
            },
            include: [{
                model: Training
            }, {
                model: Credit
            }]
        })
    ])
    .spread((trainings, subscriptions) => R.map(training => {

        training.dataValues.utilization = Math.round(training.Subscriptions.length / training.max * 100)

        if (auth.isClient) {                    
            const subscription = R.find(subscription => subscription.Client.id === auth.id, training.Subscriptions)                       
            const involved = training.dataValues.involved = !!subscription
            training.dataValues.attendee = involved && moment().isBefore(training.from)
            training.dataValues.participated = involved 
                && moment().isAfter(training.from)
                && subscription.Attendee.checkIn
            training.dataValues.missed = involved 
                && moment().isAfter(training.to)
                && !subscription.Attendee.checkIn
            training.dataValues.canJoin = !involved 
                && moment().isBefore(training.from)
                && subscriptions.filter(subscription => 
                    moment().startOf('day').isBefore(subscription.to)
                    && subscription.Credits.reduce((acc, credit) => { 
                        if ((!credit.training_type_id || credit.training_type_id === training.TrainingType.id)
                         && (!credit.coach_id || credit.coach_id === training.Coach.id)) {
                            acc += credit.amount
                        }
                        return acc
                    }, 0) - subscription.Trainings.length > 0).length > 0
            training.dataValues.canLeave = training.Subscriptions.find(subscription => subscription.Client.id === auth.id)
                && moment().add({ hours: rules.minHoursToLeaveTraining() }).isBefore(training.from)
        }

        if (auth.isClient || (auth.isCoach && training.Coach.id !== auth.id)) {
            delete training.dataValues.max
            delete training.dataValues.Subscriptions
        }

        training.dataValues.canModify = auth.isAdmin
            || (auth.isCoach 
                && training.Coach.id === auth.id) 
                && (rules.coachCanModifyHistory() 
                    || moment().add({ hours: rules.minHoursToLeaveTraining() }).isBefore(training.from))
        return training
    }, trainings))
    .catch((error) => {
        console.log(error)
        Promise.reject(errors.missingOrInvalidParameters())
    })
}

const findTrainingType = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return TrainingType.findAll(parser.parseQuery({
        attributes: ['id', 'name']
    }, query)).catch((error) => Promise.reject(errors.missingOrInvalidParameters()))
}

const remove = (args, auth) => {

    return Promise.all([
        Training.findById(args.trainingId, {
            include: [{
                as: 'TrainingType',
                model: TrainingType
            }, {
                as: 'Coach',
                model: User
            }, {
                as: 'Subscriptions',
                model: Subscription,
                include: [{
                    as: 'Client',
                    model: User
                }]
            }]
        }), 
        Attendee.findAll({ where: { training_id: args.trainingId } })
    ]).spread((training, attendees) => {

        if (!training) {
            return Promise.reject(errors.invalidId())
        }

        if (!(auth.isAdmin || (auth.isCoach && auth.id === training.Coach.id && moment().isBefore(training.from)))) {
            return Promise.reject(errors.unauthorized())
        }

        const deleteTraining = training.destroy()

        const freeCredits = attendees.map(attendee => attendee.destroy())

        const extendSubscriptions =
                training.Subscriptions.map(subscription => {
                    subscription.to = moment(subscription.to).add({ week: 1 }).format()
                    return subscription.save()
                })

        const sendEmailNotifications =
            training.Subscriptions.map(subscription => mailerService.sendCancelledTrainingNotification(training, subscription)) 

        return Promise.all(R.flatten([deleteTraining, freeCredits, extendSubscriptions, sendEmailNotifications]))

    }).then(() => Promise.resolve('OK'))
}

const bulkEdit = (query, newValues, auth) => {
    if (!auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return Promise.all(Training.findAll(parser.parseQuery({}, query))
        .then(trainings => {
            return trainings.map(training => {
                if (newValues.trainingTypeId) {
                    training.training_type_id = newValues.trainingTypeId
                }
                if (newValues.locationId) {
                    training.location_id = newValues.locationId
                }
                if (newValues.coachId) {
                    training.coach_id = newValues.coachId
                }
                if (newValues.dayOfTheWeek) {
                    const from = moment(training.from)
                    const to = moment(training.to)
                    from.day(newValues.dayOfTheWeek === 1 ? 7 : newValues.dayOfTheWeek - 1)
                    to.day(newValues.dayOfTheWeek === 1 ? 7 : newValues.dayOfTheWeek - 1)
                    training.from = from.format()                    
                    training.to = to.format()                    
                }
                if (newValues.fromTime) {
                    const fromTime = moment(newValues.fromTime, 'hh:mm:ss')
                    const from = moment(training.from)
                    from.hour(fromTime.hour())
                    from.minute(fromTime.minute())
                    from.second(fromTime.second())
                    training.from = from.format()                    
                }
                if (newValues.toTime) {
                    const toTime = moment(newValues.toTime, 'hh:mm:ss')
                    const to = moment(training.to)
                    to.hour(toTime.hour())
                    to.minute(toTime.minute())
                    to.second(toTime.second())
                    training.to = to.format()                    
                }

                return checkCollidingTraining(training).then(training => training.save())
            })
        }))
}

const removeAll = (query, auth) => {
    if (!auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return Promise.all(Training.findAll(parser.parseQuery({}, query))
        .then(trainings => {
            return trainings.map(training => {
                return remove({ trainingId: training.id }, auth)
            })
        }))
}

module.exports = {
    add,
    find,
    findTrainingType,
    remove,
    bulkEdit,
    removeAll
}