const moment = require('moment')
const Promise = require('bluebird')
const Sequelize = require('sequelize')

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

const getCoachesStats = (_, auth) => {
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

module.exports = {
     getCoachesStats
}