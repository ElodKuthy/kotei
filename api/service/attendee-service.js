const moment = require('moment')
const R = require('ramda')
const filterIndexed = R.addIndex(R.filter)

const errors = require('../common/errors')

const roles = require('../common/roles')
const Training = require('../model/training')
const User = require('../model/user')
const Attendee = require('../model/attendee')
const Subscription = require('../model/subscription')
const SubscriptionType = require('../model/subscription-type')

const Promise = require('bluebird')

const findTraining = (training_id, auth) => {
    return Training.findAll({
        where: {
            id: training_id
        }
    }).then((trainings) => {
        if (trainings.length !== 1) {
            return Promise.reject(errors.missingOrInvalidParameters)
        }

        return Promise.resolve(trainings[0])
    })
}

const findClient = (client_id, auth) => {
    return User.findAll({
        where: {
            id: client_id
        }
    }).then((users) => {
        if (users.length !== 1) {
            return Promise.reject(errors.missingOrInvalidParameters)
        }

        return Promise.resolve(users[0])
    })
}

const findSubscriptionToAdd = (date, client_id, coach_id) => {
    return Subscription.findAll({
        where: {
            $and: [{
                from: { $lte: date }
            }, {
                to: { $gte: date }
            }, {
                client_id: client_id
            }]
        },
        order: [
            ['to', 'ASC']
        ]
    }).then((subscriptions) => {
        return Promise.all(R.map((subscription) => subscription.countTrainings(), subscriptions))
            .then((counts) => {
                return filterIndexed((subscription, index) => subscription.amount > counts[index], subscriptions)
            })
    }).then((subscriptions) => {
        if (subscriptions.length < 1) {
            return Promise.reject(errors.noCredit)
        }

        return Promise.resolve(subscriptions[0])
    })
}

const checkAttendees = (training, client) => {
    return training.getSubscriptions()
        .then((subscriptions) => {
            if (R.reduce((acc, subscription) => acc || (subscription.client_id === client.id), false, subscriptions)) {
                return Promise.reject(errors.alreadySignedUp)
            }

            if (subscriptions.length >= training.max) {
                return Promise.reject(errors.trainingFull)
            }

            return Promise.resolve(subscriptions)
        })
}

const add = (training_id, client_id, auth) => {

    if (!auth.isAuth) {
        return Promise.reject(errors.unauthorized)
    }

    return Promise.all([findTraining(training_id), findClient(client_id)])
        .spread((training, client) => {

            if (client.id !== auth.id && auth.isClient) {
                return Promise.reject(errors.unauthorized)
            }

            if (!auth.isAdmin && moment().isAfter(training.to)) {
                return Promise.reject(errors.trainingEnded)
            }

            return checkAttendees(training, client)
                .then(() => findSubscriptionToAdd(training.from, client_id, training.coach_id))
                .then((subscription) => {
                    return Attendee.findOne({
                        where: {
                            subscription_id: subscription.id,
                            training_id: training.id
                        },
                        paranoid: false
                    }).then((attendee) => {
                        if (attendee) {
                            return attendee.restore()
                        } else {
                            return subscription.addTraining(training)
                        }
                    })
                })

        })

}

const findSubscription = (training, client_id) => {
    return training.getSubscriptions()
        .then((subscriptions) => {
            return R.find((subscription) => subscription.client_id == client_id, subscriptions)
        })
}

const remove = (training_id, client_id, auth) => {

    if (!auth.isAuth) {
        return Promise.reject(errors.unauthorized)
    }

    return Promise.all([findTraining(training_id), findClient(client_id)])
        .spread((training, client) => {

            if (client.id !== auth.id && auth.isClient) {
                return Promise.reject(errors.unauthorized)
            }

            if (!auth.isAdmin && moment().diff(training.from, 'hours') > -3) {
                return Promise.reject(errors.tooLateToLeave)
            }

            return findSubscription(training, client.id)
                .then((subscription) => {
                    if (!subscription) {
                        return Promise.reject(errors.notAttendee)
                    }

                    return subscription.removeTraining(training)
                })
        })
}

const update = (training_id, client_id, checkIn, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    return Promise.all([findTraining(training_id), findClient(client_id)])
        .spread((training, client) => {

            if (!auth.isAdmin && moment().isBefore(training.from)) {
                return Promise.reject(errors.tooEarlyToCheckIn)
            }

            if (!auth.isAdmin && moment().isAfter(moment(training.to).endOf('day'))) {
                return Promise.reject(errors.trainingEnded)
            }

            return findSubscription(training, client.id)
                .then((subscription) => {
                    if (!subscription) {
                        return Promise.reject(errors.notAttendee)
                    }

                    subscription.Attendee.checkIn = checkIn
                    return subscription.Attendee.save()
                })
        })
}

module.exports = {
    add: add,
    remove: remove,
    update: update
}