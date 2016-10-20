const R = require('ramda')
const moment = require('moment')
const Promise = require('bluebird')
const Sequelize = require('sequelize')

const errors = require('../common/errors')
const logger = require('../common/logger')
const credentials = require('../common/config').databases
const modelFactory = require('../model/model')

const databases = credentials.map(credential => ({
    database: new Sequelize(credential.name, credential.user, credential.password, {
        define: {
            paranoid: true,
            underscored: true
        },
        host: credential.host,
        timezone: 'Europe/Budapest',
        logging: logger.verbose
    }),
    gym: credential.name
}))

const models = databases.map(current => ({
    model: modelFactory(current.database),
    gym: current.gym
}))

const getCoachesStats = auth => {
    if (!auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    } 

    return Promise.all(models.map(current => {
        return current.model.User.findAll({
            where: {
                role: 'coach'
            }
        })
        .then(coaches => Promise.all(coaches.map(coach => {
            return current.model.Training.findAll({
                where: {
                    from: {
                        $gte: moment().startOf('week')
                    },
                    to: {
                        $lte: moment().endOf('week')
                    },
                    coach_id: coach.id 
                },
                include: [{
                    attributes: ['name'],
                    model: current.model.TrainingType
                }]
            }).then(trainings => ({ 
                coach: {
                    fullName: coach.fullName
                }, 
                count: trainings.length, 
                trainings: trainings.map(training => ({
                    name: training.TrainingType.name, 
                    from: training.from, 
                    to: training.to 
                })) 
            }))
        })))
        .then(coaches => ({ gym: current.gym, coaches }))
    }))
}

const getTrainingsStats = (date, auth) => {
    if (!auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    if (!moment(date).isValid()) {
        return Promise.reject(errors.invalidDate())
    }

    return Promise.all(models.map(current => {
        return current.model.Training.findAll({
            where: {
                from: {
                    $gte: moment(date).startOf('month')
                },
                to: {
                    $lte: moment(date).endOf('month')
                }
            },
            attributes: ['from', 'to', 'max'],
            include: [{
                    attributes: ['name'],
                    model: current.model.TrainingType
            }, {
                attributes: ['familyName', 'givenName'],
                model: current.model.User,
                as: 'Coach'
            }, {
                attributes: ['name'],
                model: current.model.Location,
                as: 'Location'
            }, {
                attributes: ['id'],
                model: current.model.Subscription,
                as: 'Subscriptions'
            }]
        })
        .then(trainings => trainings.map(training => ({
            name: training.TrainingType.name,
            coach: training.Coach.fullName,
            location: training.Location.name,
            from: training.from,
            to: training.to,
            utilization: training.Subscriptions.length,
            max: training.max
        })))
        .then(trainings => R.groupWith((a, b) => {
            const fromA = moment(a.from)
            const fromB = moment(b.from)
            return a.name === b.name
                && a.location === b.location
                && fromA.day() === fromB.day()
                && fromA.hour() === fromB.hour()
                && fromA.minute() === fromB.minute()
                && fromA.second() === fromB.second()
        }, trainings))
        .then(trainings => trainings.map(training => training.reduce((acc, curr) => {
            acc.utilization += curr.utilization
            acc.max += curr.max
            return acc
        })))
        .then(trainings => ({ gym: current.gym, from: moment().startOf('month'), to: moment().endOf('month'), trainings }))
    }))
}

const getClientsStats = auth => {
    if (!auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return Promise.all(models
        .filter(current => ['retro', 'omszk', 'zuglo'].indexOf(current.gym) > -1)
        .map(current => {
            return current.model.User.findAll({
                where: {
                    role: 'client'
                },
                include: [{
                    model: current.model.User,
                    as: 'Coach'
                }, {
                    model: current.model.Subscription,
                    as: 'Subscriptions',
                    include: [{
                        model: current.model.Credit,
                        as: 'Credits',
                        include: [{
                            model: current.model.TrainingType,
                            as: 'TrainingType'
                        }]
                    }, {
                        model: current.model.User,
                        as: 'Coach'
                    }, {
                        model: current.model.SubscriptionType,
                        as: 'SubscriptionType'
                    }]
                }]
            })
            .map(user => {
                function getCoaches(acc, curr) {
                    if (curr.Coach && acc.indexOf(curr.Coach.fullName) === -1) {
                        acc.push(curr.Coach.fullName)
                    }
                    return acc
                }
                function getTrainingTypes(acc, curr) {
                    if (curr.TrainingType && acc.indexOf(curr.TrainingType.name) === -1) {
                        acc.push(curr.TrainingType.name)
                    }
                    return acc
                }
                return {
                    name: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    coaches: R.union((user.Coach ? [user.Coach.fullName] : []), user.Subscriptions.reduce(getCoaches, [])),
                    registered: user.created_at,
                    trainings: user.Subscriptions.reduce((acc, curr) => {
                        return R.union(acc.concat(curr.SubscriptionType.name), curr.Credits.reduce(getTrainingTypes, []))
                    }, []),
                    active: user.Subscriptions.some(subscription => moment().isBefore(subscription.to))
                }
            })
            .then(clients => ({ gym: current.gym, clients }))
        })
    )
}

module.exports = {
     getCoachesStats,
     getTrainingsStats,
     getClientsStats
}