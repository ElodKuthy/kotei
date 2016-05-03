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
const Attendee = model.Attendee

const attendeeService = require('./attendee-service')

const mailerService = require('./mailer-service')

const Promise = require('bluebird')

const mapIndexed = R.addIndex(R.map)

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
            }, {
                attributes: ['id', 'familyName', 'givenName'],
                model: User,
                as: 'Coach'
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
    return Subscription.create(subscription, { include: [ Credit ] }).then((result) => {
        subscription.id = result.id
        return subscription
    })
}

const orDatesAndLocation = R.map((training) => { 
    return { 
        $and: [
            { from: training.from },
            { location_id: training.Location.id }
        ] 
    } 
})

const addOneWeek = R.map((training) => {
    training.from = moment(training.from).add({ week: 1 }).format()
    training.to = moment(training.to).add({ week: 1 }).format()
    return training
})

const concat = (a, b) => b ? R.concat(a, b) : a

const addToDefaultTraining = (clientId, trainings, index, auth) => {
    if (trainings.length <= index) {
        return Promise.resolve([])
    }
    
    return attendeeService.add(trainings[index].id, clientId, auth)
        .catch(() => Promise.resolve())
        .then(() => addToDefaultTraining(clientId, trainings, index + 1, auth))
}

const addToDefaultTrainings = (subscription, defaultTrainings, auth) => {
    
    if (!defaultTrainings || !defaultTrainings.length || moment(defaultTrainings[0].from).isAfter(subscription.to)) {
        return Promise.resolve([])
    }

    const trainings = Training.findAll({
        where: {
            $or: orDatesAndLocation(defaultTrainings)
        }
    })

    return trainings
        .then(trainings => addToDefaultTraining(subscription.client_id, trainings, 0, auth))
        .catch(() => Promise.resolve())
        .then(() => {
            return addToDefaultTrainings(subscription, addOneWeek(defaultTrainings), auth)
        }).then(additionalTrainings => {
           return Promise.resolve(concat(trainings.value(), additionalTrainings))
        })
}

const sendEmail = (newSubscription) => {
    if (newSubscription.sendEmail) {
        Subscription.findById(newSubscription.id, {
            attributes: ['from', 'to', 'price'],
            include: [{
                attributes: ['familyName', 'givenName', 'nickname'],
                model: User,
                as: 'Coach'
            }, {
                attributes: ['familyName', 'givenName', 'nickname', 'email'],
                model: User,
                as: 'Client'
            }, {            
                attributes: ['amount'],
                model: Credit,
                as: 'Credits'
            }]
        }).then(subscription => {
            subscription.all = R.reduce((acc, credit) => acc + credit.amount, 0, newSubscription.Credits)
            mailerService.sendNewSubscriptionNotification(subscription)
        })
    }
    
    return newSubscription
}

const add = (subscription, auth) => {

    return checkAuth(subscription, auth)
        .then(checkDates)
        .then(checkSubscriberIsClient)
        .then(checkIssuerIsCoach)
        .then(decorateNewSubcriptionData)
        .then(addSubscription)
        .then(sendEmail)
        .then((newSubscription) => addToDefaultTrainings(newSubscription, newSubscription.defaultTrainings, auth))
}

const update = (updatedSubscription, auth) => {

    if (!auth.isAdmin) {
        return Promise.reject(errors.unauthorized)
    }

    return Subscription.findById(updatedSubscription.id)
        .then((subscription) => {
            if (!subscription) {
                return Promise.reject(errors.invalidId)
            }
            subscription.subscription_type_id = updatedSubscription.subscription_type_id
            subscription.from = updatedSubscription.from
            subscription.to = updatedSubscription.to
            subscription.coach_id = updatedSubscription.coach_id
            subscription.price = updatedSubscription.price
            subscription.Credits = updatedSubscription.Credits
            return subscription
        })
        .then(checkDates)
        .then(checkSubscriberIsClient)
        .then(checkIssuerIsCoach)
        .then(subscription => {
            return Promise.all(R.map(credit => Credit.findById(credit.id), subscription.Credits))
                .then(credits => mapIndexed((credit, index) => {
                    credit.amount = subscription.Credits[index].amount
                    return credit
                }, credits))
                .then(credits => Promise.all(R.map(credit => credit ? credit.save() : Promise.resolve(), credits)))
                .then(() => subscription)
        })
        .then((subscription) => subscription.save())
}


const find = (query, auth) => {
    if (!auth.isAuth) {
        return Promise.reject(errors.unauthorized)
    }

    return Subscription.findAll(parser.parseQuery({
        attributes: ['id', 'from', 'to', 'price'],
        include: [{
             attributes: ['id', 'name'],
             model: SubscriptionType
        }, {
            attributes: ['id', 'familyName', 'givenName', 'nickname'],
            model: User,
            as: 'Coach'
        }, {
            attributes: ['id', 'familyName', 'givenName', 'nickname', 'email'],
            model: User,
            as: 'Client'
        }, {            
            attributes: ['id', 'amount'],
            model: Credit,
            as: 'Credits',
            include: [{
                attributes: ['id', 'name'],
                model: TrainingType
            }]
        }, {
            attributes: ['id', 'from', 'to'],
            model: Training,
            include: [{
                attributes: ['name'],
                model: TrainingType
            }]
        }]
    }, query)).catch((error) => Promise.reject(errors.missingOrInvalidParameters))
}

const remove = (args, auth) => {
    if (!auth.isAdmin && !auth.isCoach) {
        return Promise.reject(errors.unauthorized)
    }
    
    return Subscription.findById(args.subscriptionId, {
            include: [Credit]
        })
        .then((subscription) => {
            if (!subscription) {
                return Promise.reject(errors.invalidId)
            }
            
            if (auth.isCoach && auth.id !== subscription.coach_id) {
                return Promise.reject(errors.unauthorized)
            }
            
            return Attendee.findAll({
                where: {
                    subscription_id: args.subscriptionId
                }
            })
            .then(attendees => Promise.all(R.map(attendee => attendee.destroy(), attendees)))
            .then(() => Promise.all(R.map(credit => credit.destroy(), subscription.Credits)))
            .then(() => subscription.destroy())
        })
}

module.exports = {
    findSubscriptionType: findSubscriptionType,
    findSubscriptionTemplate: findSubscriptionTemplate,
    add: add,
    find: find,
    update: update,
    remove: remove
}