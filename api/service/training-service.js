const moment = require('moment')

const errors = require('../common/errors')

const roles = require('../common/roles')
const Training = require('../model/training')
const User = require('../model/user')
const SubscriptionType = require('../model/subscription-type')

const Promise = require('bluebird')

const add = (newTraining, auth) => {
    if (!auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    if (moment(newTraining.from).add({ minutes: 5 }).isAfter(newTraining.to)) {
        return Promise.reject(errors.trainingTooShort)
    }

    if (!moment(newTraining.from).isSame(newTraining.to, 'day')) {
        return Promise.reject(errors.trainingTooLong)
    }

    const coach = User.findAll({
        where: {
            $and: [{
                id: newTraining.coach_id
            }, {
                role: roles.coach
            }]
        }
    })

    const collidingTrainings = Training.findAll({
        where: {
            $and: [{
                location_id: newTraining.location_id
            }, {
                $or: [
                    { from: { $and: [ { $gt: newTraining.from }, { $lte: newTraining.to } ] } },
                    { to: { $and: [ { $gte: newTraining.from }, { $lt: newTraining.to } ] } }
                ]
            }]
        }
    })

    const subscriptionTypes = SubscriptionType.findAll()

    return Promise.all([coach, collidingTrainings, subscriptionTypes]).spread((coach, collidingTrainings, subscriptionTypes) => {

        if(coach.length !== 1) {
            return Promise.reject(errors.invalidCoach)
        }

        if (collidingTrainings.length) {
            return Promise.reject(errors.trainingTimeCollide)
        }

        return Training.create(newTraining)
            .then((training) => {
                return training.addSubscriptionTypes(newTraining.subscription_type_ids)
            })
            .catch((error) => {
                return Promise.reject(errors.missingOrInvalidParameters)
            })
    })

}

module.exports = {
    add: add
}