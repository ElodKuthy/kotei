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

const getCoachesStats = (auth) => {
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

const getTrainingsStats = (auth) => {
    if (!auth.isAdmin) {
        return Promise.reject(errors.unauthorized())
    }

    return Promise.all(models.map(current => {
        return current.model.Training.findAll({
            where: {
                from: {
                    $gte: moment().startOf('month')
                },
                to: {
                    $lte: moment().endOf('month')
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

module.exports = {
     getCoachesStats,
     getTrainingsStats
}