const moment = require('moment')
const R = require('ramda')

const errors = require('../common/errors')
const parser = require('../common/parser')
const roles = require('../common/roles')
const logger = require('../common/logger')
const rules = require('../common/rules')

const model = require('../model/model')()
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
const TrainingCategory = model.TrainingCategory

const attendeeService = require('./attendee-service')

const mailerService = require('./mailer-service')

const Promise = require('bluebird')

const mapIndexed = R.addIndex(R.map)

const findSubscriptionType = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return SubscriptionType.findAll(parser.parseQuery({
        attributes: ['id', 'name']
    }, query)).catch((error) => Promise.reject(errors.missingOrInvalidParameters()))
}

const findSubscriptionTemplate = (query, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return SubscriptionTemplate.findAll(parser.parseQuery({
        attributes: ['id', 'subscription_type_id', 'allowFreeCredits'],
        include: [{
            attributes: ['id', 'name'],
            model: SubscriptionType
        }, {
            attributes: ['id', 'valid', 'price'],
            model: SubscriptionVariant
        }, {
            attributes: ['id', 'amount'],
            model: CreditTemplate,
            include: [{
                attributes: ['id', 'name'],
                model: TrainingType
            }, {
                attributes: ['id', 'name'],
                model: TrainingCategory
            }, {
                attributes: ['id', 'familyName', 'givenName', 'nickname'],
                model: User,
                as: 'Coach'
            }]
        }]
    }, query))
    .then(subscriptions => {
        const allowFreeCreditsOnCreateSubcription = rules.allowFreeCreditsOnCreateSubcription()
        subscriptions.map(subscription => {
            if (subscription.dataValues.allowFreeCredits === null) {
                subscription.dataValues.allowFreeCredits = allowFreeCreditsOnCreateSubcription
            }
            return subscription
        })
        return subscriptions
    })
    .catch((error) => {
        Promise.reject(errors.missingOrInvalidParameters())
    })
}

const checkAuth = (subscription, auth) => {
    if (!auth.isCoach && !auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    if (auth.isCoach) {
        if (subscription.coach_id != auth.id) {
            return Promise.reject(errors.unauthorized())
        }
    }

    return Promise.resolve(subscription)
}

const checkDates = (subscription) => {
    if (moment(subscription.from).isAfter(subscription.to)) {
        Promise.reject(errors.missingOrInvalidParameters())
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
            : Promise.reject(errors.missingOrInvalidParameters())
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
            : Promise.reject(errors.missingOrInvalidParameters())
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
        if (credit.TrainingCategory) {
            credit.training_category_id = credit.TrainingCategory.id
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
        .catch(() => {
            return Promise.resolve()
        })
        .then(() => addToDefaultTraining(clientId, trainings, index + 1, auth))
}

const addToDefaultTrainings = (subscription, defaultTrainings, auth) => {

    if (!defaultTrainings || !defaultTrainings.length || moment(defaultTrainings[0].from).isAfter(subscription.to)) {
        return Promise.resolve([])
    }

    const trainings = Training.findAll({
        where: {
            $or: orDatesAndLocation(defaultTrainings)
        },
        paranoid: false
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
            mailerService.sendNewSubscriptionNotification(subscription).then(result => logger.info(result)).catch((error => logger.error(error)))
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
        return Promise.reject(errors.unauthorized())
    }

    return Subscription.findById(updatedSubscription.id)
        .then((subscription) => {
            if (!subscription) {
                return Promise.reject(errors.invalidId())
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
        return Promise.reject(errors.unauthorized())
    }

    return Subscription.findAll(parser.parseQuery({
        attributes: ['id', 'from', 'to', 'price'],
        include: [{
             attributes: ['id', 'name'],
             model: SubscriptionType
        }, {
            attributes: ['id', 'familyName', 'givenName', 'nickname', 'email'],
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
            }, {
                attributes: ['id', 'familyName', 'givenName'],
                model: User,
                as: 'Coach'
            }, {
                attributes: ['id'],
                model: Subscription,
                as: 'Subscriptions',
                include: [{
                    attributes: ['id'],
                    model: User,
                    as: 'Client'
                }]
            }]
        }]
    }, query))
    .then(subscriptions => subscriptions.map(subscription => {
        subscription.dataValues.canModify = auth.isAdmin
            || (auth.isCoach && rules.coachCanModifyHistory())
        subscription.Trainings = subscription.Trainings.map(training => {
            training.dataValues.canModify = auth.isAdmin
                || (auth.isCoach
                    && ((training.Coach && training.Coach.id === auth.id) || rules.coachCanModifyOthersTrainings())
                    && (rules.coachCanModifyHistory()
                        || moment().add({ hours: rules.minHoursToLeaveTraining() }).isBefore(training.from)))
            training.dataValues.canLeave =
                auth.isClient
                    && training.Subscriptions.find(subscription => subscription.Client.id === auth.id)
                    && moment().add({ hours: rules.minHoursToLeaveTraining() }).isBefore(training.from)
                    && (!rules.gremlinAttendees() || moment(training.from).hours() >= 9 || moment().isBefore(moment(training.from).startOf('day').subtract({ hours: 3 })))
            return training
        })

        if (!subscription.dataValues.Coach) {
            subscription.dataValues.Coach = {
                familyName: "Törölt",
                fullName: "Törölt Edző",
                givenName: "Edző",
                id: -1,
                nickname: "Törölt Edző",
            }
        }

        return subscription
    }))
    .catch((error) => {
        Promise.reject(errors.missingOrInvalidParameters())
    })
}

const remove = (args, auth) => {
    if (!auth.isAdmin && !auth.isCoach) {
        return Promise.reject(errors.unauthorized())
    }

    return Subscription.findById(args.subscriptionId, {
            include: [Credit]
        })
        .then((subscription) => {
            if (!subscription) {
                return Promise.reject(errors.invalidId())
            }

            if (auth.isCoach && auth.id !== subscription.coach_id) {
                return Promise.reject(errors.unauthorized())
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

const createNewSubscripitonTemplate = template => {
    return SubscriptionVariant.create({
            valid: template.valid,
            price: template.price
    }).then(subscriptionVariant => SubscriptionTemplate.create({
        subscription_type_id: template.subscription_type_id,
        allowFreeCredits: template.allowFreeCredits,
        subscription_variant_id: subscriptionVariant.id,
        CreditTemplates: [{
            amount: template.amount,
            training_type_id: template.training_type_id,
            coach_id: template.coach_id,
            training_category_id: template.training_category_id
        }]
    }, {
        include: [CreditTemplate]
    }))
}

const updateSubscripitonTemplate = template => {
    return SubscriptionVariant.findById(template.subscription_variant_id)
        .then(variant => {
            if (!variant) {
                return Promise.reject(errors.invalidId())
            }
            variant.valid = template.valid
            variant.price = template.price
            return variant.save()
        })
        .then(() => CreditTemplate.findById(template.credit_template_id))
        .then(creditTemplate => {
            if (!creditTemplate) {
                return Promise.reject(errors.invalidId())
            }
            creditTemplate.amount = template.amount,
            creditTemplate.training_type_id = template.training_type_id,
            creditTemplate.coach_id = template.coach_id,
            creditTemplate.training_category_id = template.training_category_id
            return creditTemplate.save()
        })
        .then(() => SubscriptionTemplate.findById(template.id))
        .then(templateToUpdate => {
            if (!templateToUpdate) {
                return Promise.reject(errors.invalidId())
            }
            templateToUpdate.subscription_type_id = template.subscription_type_id
            templateToUpdate.allowFreeCredits = template.allowFreeCredits
            return templateToUpdate.save()
        })
}

const addOrUpdateSubscriptionTemplate = (template, auth) => {
    if (!auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    if (!template.id) {
        return createNewSubscripitonTemplate(template)
            .then(() => 'OK')
    } else {
        return updateSubscripitonTemplate(template)
            .then(() => 'OK')
    }
}

const deleteSubscriptionTemplate = ({id}, auth) => {
    if (!auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return SubscriptionTemplate.findById(id).then(template => {
        if (!template) {
            return Promise.reject(errors.invalidId())
        }
        return template.destroy()
    }).then(() => 'OK')
}


module.exports = {
    findSubscriptionType,
    findSubscriptionTemplate,
    add,
    find,
    update,
    remove,
    addOrUpdateSubscriptionTemplate,
    deleteSubscriptionTemplate
}