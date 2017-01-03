const moment = require('moment')
const R = require('ramda')
const filterIndexed = R.addIndex(R.filter)

const errors = require('../common/errors')

const roles = require('../common/roles')
const model = require('../model/model')()
const rules = require('../common/rules')
const Training = model.Training
const User = model.User
const Attendee = model.Attendee
const Subscription = model.Subscription
const SubscriptionType = model.SubscriptionType
const Credit = model.Credit

const Promise = require('bluebird')

const findTraining = (training_id, auth) => {
    return Training.findById(training_id).then((training) => {
        if (!training) {
            return Promise.reject(errors.missingOrInvalidParameters())
        }

        return Promise.resolve(training)
    })
}

const findClient = (client_id, auth) => {
    return User.findById(client_id).then((user) => {
        if (!user) {
            return Promise.reject(errors.missingOrInvalidParameters())
        }

        return Promise.resolve(user)
    })
}

const findSubscriptionToAdd = (training, client) => {
    return Subscription.findAll({
        where: {
            $and: [{
                from: { $lte: moment(training.from).endOf('day').format('YYYY-MM-DD hh:mm:ss') }
            }, {
                to: { $gte: moment(training.from).format('YYYY-MM-DD') }
            }, {
                client_id: client.id
            }]
        },
        include: [ Credit ],
        order: [
            ['to', 'ASC']
        ]
    })
    .then((subscriptions) => {
        // TODO: Refactoring to handle correctly training restricted credits as well, this works only for not restrited credits
        return Promise.all(R.map((subscription) => subscription.countTrainings(), subscriptions))
            .then((counts) => {
                return filterIndexed((subscription, index) => {
                    const amount = R.reduce((acc, credit) => {
                        if ((!credit.training_type_id
                            || credit.training_type_id === training.training_type_id)
                            && (!credit.coach_id
                            || credit.coach_id === training.coach_id)
                            && (!credit.training_category_id
                            || credit.training_category_id === training.training_category_id)) {
                            acc += credit.amount
                        }

                        return acc
                    }, 0, subscription.Credits)

                    return amount > counts[index]
                }, subscriptions)
            })
    })
    .then((subscriptions) => {
        if (subscriptions.length < 1) {
            return Promise.reject(errors.noCredit())
        }

        return Promise.resolve(subscriptions[0])
    })
}

const checkAttendees = (training, client) => {
    return training.getSubscriptions()
        .then((subscriptions) => {
            if (R.reduce((acc, subscription) => acc || (subscription.client_id === client.id), false, subscriptions)) {
                return Promise.reject(errors.alreadySignedUp())
            }

            if (subscriptions.length >= training.max) {
                return Promise.reject(errors.trainingFull())
            }

            return Promise.resolve(subscriptions)
        })
}

const add = (training_id, client_id, auth) => {

    if (!auth.isAuth) {
        return Promise.reject(errors.unauthorized())
    }

    return Promise.all([findTraining(training_id), findClient(client_id)])
        .spread((training, client) => {

            if (auth.isClient && client.id !== auth.id) {
                return Promise.reject(errors.unauthorized())
            }

            if (auth.isClient && moment().isAfter(training.to)) {
                return Promise.reject(errors.trainingEnded())
            }

            if (training.deleted_at) {
                return Promise.reject(errors.trainingEnded())
            }

            return checkAttendees(training, client)
                .then(() => findSubscriptionToAdd(training, client))
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
        return Promise.reject(errors.unauthorized())
    }

    return Promise.all([findTraining(training_id), findClient(client_id)])
        .spread((training, client) => {

            if (auth.isClient && client.id !== auth.id) {
                return Promise.reject(errors.unauthorized())
            }

            if (auth.isCoach && training.coach_id !== auth.id && !rules.coachCanModifyOthersTrainings()) {
                return Promise.reject(errors.unauthorized())
            }

            if (auth.isClient && moment().diff(training.from, 'hours') > -rules.minHoursToLeaveTraining()) {
                return Promise.reject(errors.tooLateToLeave())
            }

            return findSubscription(training, client.id)
                .then((subscription) => {
                    if (!subscription) {
                        return Promise.reject(errors.notAttendee())
                    }

                    return subscription.removeTraining(training)
                })
        })
}

const update = (training_id, client_id, checkIn, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return Promise.all([findTraining(training_id), findClient(client_id)])
        .spread((training, client) => {

            if (auth.isCoach && training.coach_id !== auth.id && !rules.coachCanModifyOthersTrainings()) {
                return Promise.reject(errors.unauthorized())
            }

            if (!auth.isAdmin && moment().isBefore(training.from)) {
                return Promise.reject(errors.tooEarlyToCheckIn())
            }

            // if (!auth.isAdmin && moment().isAfter(moment(training.to).endOf('day'))) {
            //     return Promise.reject(errors.trainingEnded())
            // }

            return findSubscription(training, client.id)
                .then((subscription) => {
                    if (!subscription) {
                        return Promise.reject(errors.notAttendee())
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